declare namespace Lib.message {

    interface Server {
        init(version: any, config: any, banned_info: any): any;
        inited(): any;
        reinited(): any;
        result(result: any): any;
        startGame(): any;
        changeRoomConfig(config: any): any;
        changeNumConfig(num: any, index: any, bool: any): any;
        chat(id: any, str: any): any;
        giveup(player: any): any;
        auto(): any;
        unauto(): any;
        exec(func: any): any;
        log(): any;
    }

    interface Client {
        log(arr: any): any;
        opened(): any;
        onconnection(id: any): any;
        onmessage(id: any, message: any): any;
        onclose(id: any): any;
        selfclose(): any;
        reloadroom(forced: any): any;
        createroom(index: any, config: any, mode: any): any;
        enterroomfailed(): any;
        roomlist(list: any, events: any, clients: any, wsid: any): any;
        updaterooms(list: any, clients: any): any;
        updateclients(clients: any, bool: any): any;
        updateevents(events: any): any;
        eventsdenied(reason: any): any;
        init(id: any, config: any, ip: any, servermode: any, roomId: any): any;
        reinit(config: any, state: any, state2: any, ip: any, observe: any, onreconnect: any): any;
        exec(func: any): any;
        denied(reason: any): any;
        cancel(id: any): any;
        closeDialog(id: any): any;
        createDialog(id: any): any;
        gameStart(): any;
        updateWaiting(map: any): any;
    }
}