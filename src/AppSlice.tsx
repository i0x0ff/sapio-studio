import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Data } from './Data/ContractManager';
import { AppDispatch, RootState } from './Store/store';

type ContractArgs = {
    arguments: Object;
    context: {
        amount: number;
        network: 'Regtest' | 'Signet' | 'Testnet' | 'Bitcoin';
        effects?: {
            effects?: Record<string, Record<string, Object>>;
        };
    };
};

type CreatedContract = {
    name: string;
    args: ContractArgs;
    data: Data;
};

type Pages = 'ContractCreator' | 'ContractViewer' | 'Wallet';
type StateType = {
    data: CreatedContract | null;
    counter: number;
    status_bar: boolean;
    showing: Pages;
};
function default_state(): StateType {
    return {
        data: null,
        counter: -1,
        status_bar: true,
        showing: 'Wallet',
    };
}

export const appSlice = createSlice({
    name: 'App',
    initialState: default_state(),
    reducers: {
        switch_showing: (state, action: PayloadAction<Pages>) => {
            state.showing = action.payload;
        },
        load_new_model: (state, action: PayloadAction<CreatedContract>) => {
            state.data = action.payload;
            state.counter += 1;
        },
        toggle_status_bar: (state) => {
            state.status_bar = !state.status_bar;
        },
        add_effect_to_contract: (
            state,
            action: PayloadAction<[string, string, Object]>
        ) => {
            if (state.data === null) return;
            if (state.data.args.context.effects === undefined)
                state.data.args.context.effects = {};
            if (state.data.args.context.effects.effects === undefined)
                state.data.args.context.effects.effects = {};
            let data =
                state.data.args.context.effects.effects[action.payload[0]] ??
                {};
            data[action.payload[1]] = action.payload[2];
            state.data.args.context.effects.effects[action.payload[0]] = data;
        },
    },
});

export const {
    switch_showing,
    load_new_model,
    toggle_status_bar,
    add_effect_to_contract,
} = appSlice.actions;

export const create_contract_of_type =
    (type_arg: string, contract: any) =>
    async (dispatch: AppDispatch, getState: () => RootState) => {
        const compiled_contract = await window.electron.create_contract(
            type_arg,
            contract
        );
        if (compiled_contract)
            dispatch(
                load_new_model({
                    args: JSON.parse(contract),
                    name: type_arg,
                    data: JSON.parse(compiled_contract),
                })
            );
    };
export const recreate_contract =
    () => async (dispatch: AppDispatch, getState: () => RootState) => {
        let s = getState();
        if (s.appReducer.data === null) return;
        return create_contract_of_type(
            s.appReducer.data.name,
            JSON.stringify(s.appReducer.data.args)
        )(dispatch, getState);
    };

export const create_contract_from_file =
    () => async (dispatch: AppDispatch, getState: () => RootState) => {
        window.electron
            .open_contract_from_file()
            .then(JSON.parse)
            .then(load_new_model)
            .then(dispatch);
    };

export const selectContract: (state: RootState) => [Data | null, number] = (
    state: RootState
) => [state.appReducer.data?.data ?? null, state.appReducer.counter];

export const selectCreatedContract: (
    state: RootState
) => CreatedContract | null = (state: RootState) => {
    return state.appReducer.data;
};

export const selectStatusBar: (state: RootState) => boolean = (
    state: RootState
) => state.appReducer.status_bar;

export const selectHasEffect: (
    state: RootState
) => (s: string, key: string) => boolean = (state: RootState) => {
    return (s, key) => {
        const d = state.appReducer.data?.args.context.effects?.effects ?? {};
        return d.hasOwnProperty(s) && d[s]!.hasOwnProperty(key);
    };
};

export const selectShowing: (state: RootState) => Pages = (state: RootState) =>
    state.appReducer.showing;
export default appSlice.reducer;
