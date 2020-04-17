
import * as Bitcoin from 'bitcoinjs-lib';
import { NodeColor, UTXOFormatData } from './ContractManager';
import { OutputLinkModel } from './DiagramComponents/OutputLink';
import { SpendLinkModel } from './DiagramComponents/SpendLink/SpendLink';
import { TransactionNodeModel } from './DiagramComponents/TransactionNode/TransactionNodeModel';
import { Viewer } from './EntityViewer';
import './Transaction.css';
import { keyFn, OpaqueKey } from './util';
import { UTXOMetaData, UTXOModel } from './UTXO';


export class TransactionModel extends TransactionNodeModel implements Viewer {
    type: string;
    broadcastable: boolean;
    broadcastable_hook: (b:boolean) => void;
    tx: Bitcoin.Transaction;
    utxo_models: Array<UTXOModel>;
    public utxo_links: Array<OutputLinkModel>;
    public input_links: Array<SpendLinkModel>;
	constructor(tx:Bitcoin.Transaction, update:any, name:string, color:NodeColor, utxo_labels: Array<UTXOFormatData|null>) {
		super(tx.getId().substr(0, 16), name, color.get());
        this.type = "txn";
        this.broadcastable = false;
        this.broadcastable_hook = (b)=>{};
		this.tx = tx;
        this.utxo_models = [];
        this.utxo_links = [];
        this.input_links = [];
        for (let y = 0; y < this.tx.outs.length; ++y) {
            const subcolor = color.clone();
            subcolor.fade();
            let metadata  = utxo_labels[y] || {color: subcolor.get(), label:  name };
            // TODO: Get rid of assertion
            const out : Bitcoin.TxOutput = <Bitcoin.TxOutput>tx.outs[y];
            let utxo = new UTXOModel(new UTXOMetaData(out.script, out.value, tx, y), update, metadata.label, new NodeColor(metadata.color), this);
            this.utxo_models.push(utxo);
            this.utxo_links.push(this.addOutPort('output ' + y).link(utxo.addInPort('create')));
        }
		this.registerListener({
			selectionChanged: update
		});
	}
    remove_from_model(model:any) {
        model.removeNode(this);
        this.utxo_models.map((x)=>model.removeNode(x));
        this.utxo_links.map((x)=>model.removeLink(x));
        this.input_links.map((x)=>model.removeLink(x));
    }
    is_broadcastable() {
        return this.broadcastable;
    }
    set_broadcastable(b=true) {
        if (b !== this.broadcastable)
            this.broadcastable_hook(b);
        this.broadcastable = b;
    }
    set_broadcastable_hook(hook=(b:boolean)=>{}) {
        this.broadcastable_hook =hook;
    }

    consume_inputs(txn_models:Array<TransactionModel>, inputs_map:Map<OpaqueKey,Array<number>>, txns:Array<Bitcoin.Transaction>, model:any) {
        const to_clear : Array<Bitcoin.Transaction>= [];
        this.tx.ins.forEach((inp) => {
            const key = keyFn(inp);
            const to_prune = inputs_map.get(key) || [];
            to_prune.forEach((i)=> {
                if (txn_models[i].tx !== this.tx) {
                    txn_models[i].remove_from_model(model);
                    to_clear.push(txn_models[i].tx);
                }
            });
        });
        while (to_clear.length) {
            const tx = <Bitcoin.Transaction> to_clear.pop();
            // now remove children
            for (let i = 0; i < tx.outs.length; ++i) {
                const key = keyFn({hash: tx.getHash(), index:i});
                const to_prune = inputs_map.get(key);

                if (to_prune) {
                    to_prune.forEach((x)=> txn_models[x].remove_from_model(model));
                    to_clear.push(...to_prune.map((i) => txns[i]));
                }
            }
        }
    }
}


