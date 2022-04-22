declare namespace Lib.element {
    /** 
     * 客户端玩家的联机基本操作 
     * sendTo,connection
     */
    interface Client {
        /**
         * 发送信息
         */
        send(...args): Client;
        /**
         * 断连
         */
        close(): Client;

        inited:boolean;
        /** 是否断连 */
        closed:boolean;

        ws:WebSocket;
    }
}

interface PlayerWs extends Lib.element.Client {
    avatar:string;
    id:string;
    nickname:string;
    inited:boolean;
    closed:boolean;
}