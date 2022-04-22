declare namespace Lib.element {

    interface Nodews {
        send(message: any): any;
        on(type: any, func: any): any;
        close(): any;
    }
}