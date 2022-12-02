import todoApi, { Todo, TodoList } from "./todo-api";

export type CreateListMessage = {
    type: "createList";
    message: TodoList;
}

export type DeleteListMessage = {
    type: "deleteList";
    message: {
        index: number;
    };
}

export type AddTodoMessage = {
    type: "addToDo";
    message: {
        listIndex: number;
        item: Todo;
    };
}

export type RemoveTodoMessage = {
    type: "removeTodo";
    message: {
        listIndex: number;
        itemIndex: number;
    };
}

export type MoveTodoMessage = {
    type: "moveTodo";
    message: {
        listIndex: number;
        sourceIndex: number;
        destIndex: number;
    };
}

export type EditTodoMessage = {
    type: "editTodo";
    message: {
        listIndex: number;
        itemIndex: number;
        newValue: Todo;
    };
}

export type RawMessage = CreateListMessage | DeleteListMessage | AddTodoMessage | RemoveTodoMessage | MoveTodoMessage | EditTodoMessage;

export type SocketMessage = RawMessage & {sequenceId: number};


export type SocketClient = {
    handleMessage(message: SocketMessage) : never;
}

class FakeSocket {
    private clients : SocketClient[];
    private sequenceId : number;

    constructor() {
        this.clients = [];
        this.sequenceId = 0;
    }

    addListener(client: SocketClient) {
        this.clients.push(client);
    }

    removeListener(client: SocketClient) {
        this.clients = this.clients.filter((currentClient) => currentClient !== client);
    }

    dispatchMessage(message: RawMessage) {
        this.clients.forEach((client) => {
            const socketMessage : SocketMessage = {sequenceId: this.sequenceId, ...message }
            client.handleMessage(socketMessage);
        })
    }
}

export class RandomActionExecutor {

    private running: boolean;
    private minPeriod: number; 
    private maxPeriod: number;
    private readonly actions = [this.moveTodo, this.addTodo, this.createList, this.deleteList, this.removeTodo];

    constructor() {
        this.running = false;
        this.minPeriod = 1;
        this.maxPeriod = 5;
    }

    /**
     * Start randomly performing actions against the fake api
     * 
     * @param minPeriod minimum period in seconds between two random actions
     * @param maxPeriod maximum period in seconds between two random actions
     */
    launch(minPeriod: number, maxPeriod: number) {
        if (this.minPeriod < 0 || this.maxPeriod < 0 || this.minPeriod >= this.maxPeriod) {
            throw 'min period must be inferior to max period and both must be positive';
        }
        this.running = true;
        this.minPeriod = minPeriod;
        this.maxPeriod = maxPeriod;
    }

    stop() {
        this.running = false;
    }

    private run() {
        if (this.running) {
            this.performRandomAction();
            const currentTimeout = (Math.floor(Math.random() * (this.maxPeriod - this.minPeriod)) + this.minPeriod) * 1000;
            window.setTimeout(() => {
                this.run();
            }, currentTimeout);
        }
    }

    private performRandomAction() {
        const actionIndex = Math.floor(Math.random() * this.actions.length);
        this.actions[actionIndex]();
    }

    private getRandomIndex<T>(array: T[]) {
        return Math.floor(Math.random() * array.length);
    }

    private async moveTodo() {
        try {
            const getTodoListsResponse = await todoApi.getTodoLists();
            if ('response' in getTodoListsResponse) {
                const todoLists = getTodoListsResponse.response;
                const listIndex = this.getRandomIndex(todoLists);
                const todoListItems = todoLists[listIndex].items;
                const sourceIndex = this.getRandomIndex(todoListItems);
                let destIndex = this.getRandomIndex(todoListItems);
                while (destIndex === sourceIndex) {
                    destIndex = this.getRandomIndex(todoListItems);
                }
                todoApi.moveTodo(listIndex, sourceIndex, destIndex);
            }
        } catch(_e) {}
    }

    private async addTodo() {
        try {
            const getTodoListsResponse = await todoApi.getTodoLists();
            if ('response' in getTodoListsResponse) {
                const todoLists = getTodoListsResponse.response;
                const listIndex = this.getRandomIndex(todoLists);
                let description = "";
                for(let i = 0; i < 15; i++) {
                    description += String.fromCharCode(97 + Math.floor(Math.random() * 26));
                }
                const newItem = {
                    done: Math.random() >= 0.5,
                    description 
                }
                todoApi.addTodo(listIndex, newItem);
            }
        } catch(_e) {}
    }

    private async removeTodo() {
        try {
            const getTodoListsResponse = await todoApi.getTodoLists();
            if ('response' in getTodoListsResponse) {
                const todoLists = getTodoListsResponse.response;
                const listIndex = this.getRandomIndex(todoLists);
                const todoListItems = todoLists[listIndex].items;
                const itemIndex = this.getRandomIndex(todoListItems);
                todoApi.removeTodo(listIndex, itemIndex);
            }
        } catch(_e) {}
    }

    private createList() {
        try {
            let name = "";
            for(let i = 0; i < 5; i++) {
                name += String.fromCharCode(97 + Math.floor(Math.random() * 26));
            }
            todoApi.createList(name);
        } catch(_e) {}
    }

    private async deleteList() {
        try {
            const getTodoListsResponse = await todoApi.getTodoLists();
            if ('response' in getTodoListsResponse) {
                const todoLists = getTodoListsResponse.response;
                const listIndex = this.getRandomIndex(todoLists);
                todoApi.deleteList(listIndex);
            }
        } catch(_e) {}
    }
}

export default new FakeSocket();