import winston = require('winston');
import fs = require('fs');
import path = require('path');

import { IEthereumClient } from './IEthereumClient';
import { IWeb3Adapter } from './IWeb3Adapter';
import { EthereumBlock, EthereumBlockDetail } from './models/EthereumBlock';
import { EthereumTx } from './models/EthereumTx';
import { EthereumCode } from './models/EthereumCode';
import { EthereumAddress } from './models/EthereumAddress';
import { IReader } from './../interfaces/IReader';
import { TraceReader } from './readers/TraceReader';

export class EthereumClient implements IEthereumClient {
    private readonly baseClient: IWeb3Adapter;

    constructor(baseClient: IWeb3Adapter) {
        this.baseClient = baseClient;
    }

    public async GetLatestBlockNumber(): Promise<number> {
        const blockData = await this.baseClient.GetBlock('latest');
        return blockData.number;
    }

    public async GetBlockFromNumber(blockNumber: number): Promise<EthereumBlock> {
        const blockContent = await this.baseClient.GetBlock(blockNumber);
        return new EthereumBlock(blockContent);
    }

    public async GetTransaction(txHash: string): Promise<EthereumTx> {
        const tx = await this.baseClient.GetTransaction(txHash);
        const receipt = await this.baseClient.GetTransactionReceipt(txHash);
        return new EthereumTx(tx, receipt);
    }

    public async GetTrace(tx: EthereumTx): Promise<IReader<EthereumAddress>> {
        const traceLog = await this.baseClient.GetTrace(tx.Hash());
        return new TraceReader(traceLog);
    }

    public async GetCode(address: EthereumAddress): Promise<EthereumCode> {
        const code = await this.baseClient.GetCode(address.AsHex());
        return new EthereumCode(code);
    }

    public async GetData(address: EthereumAddress): Promise<any> {
        const abi = await this.baseClient.GetAbi(address.AsHex());
        let data = null;

        if (abi) {
            data = await this.baseClient.ReadContract(address.AsHex(), abi, null);
        }

        return data;
    }
}