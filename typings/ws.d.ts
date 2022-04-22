declare namespace Lib.element {

    interface WS {
        onopen(): any;
        onmessage(messageevent: any): any;
        onerror(e: any): any;
        onclose(): any;
    }
}