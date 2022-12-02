import fakeSocket from "./fake-socket";

export type TodoList = {
    items: Todo[];
    name: string;
};
export type Todo = {
    description: string;
    done: boolean;
}

export type ApiResponseWrapper<T> = ApiResponseError | {
    response: T;
}

export type ApiResponseError = {
    error: {
        code: number;
        description: string;
    };
}
class TodoApi {
    // You can change the success rate in the constructor to get random error responses from the api
    private successRate: number;

    private todos : TodoList[];

    constructor() {
        this.successRate = 1;
        this.todos = [];
    }

    private isSuccess = function isSuccess(successRate: number) : boolean {
        return Math.random() < successRate;
    }

    private buildErrorResponse = function buildErrorResponse(code: number, description: string) : ApiResponseError {
        return {
            error: {
                code,
                description
            }
        }
    }

    /**
     * Returns the list of available todoLists
     * 
     * @returns An ApiResponseWrapper containing the available todo lists. An ApiResponseError if something went wrong
     */
     async getTodoLists() : Promise<ApiResponseWrapper<TodoList[]>> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this.isSuccess(this.successRate)) {
                    // Avoid returning references to items in my local variable so that it is not modified accidentally by caller
                    resolve({
                        response: this.todos.map((todolist) => {
                            return {
                                name: todolist.name,
                                items: todolist.items.map((todo) => {return {...todo}})
                            }
                        }),
                    });
                } else {
                    reject(this.buildErrorResponse(500, "internal error"));
                }
            }, Math.floor(Math.random() * 10) * 100)
        });
    }

    /**
     * Creates a new empty todo list
     * @param name The name of the new list
     * @returns An ApiResponseWrapper containing the index of the newly created empty list. An ApiResponseError if something went wrong
     */
    async createList(name: string) : Promise<ApiResponseWrapper<number>> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this.isSuccess(this.successRate)) {
                    const length = this.todos.push({
                        name,
                        items: []
                    });
                    fakeSocket.dispatchMessage({
                        type: "createList",
                        message: {
                            name: this.todos[this.todos.length - 1].name,
                            items: [...this.todos[this.todos.length - 1].items]
                        }
                    });
                    resolve({
                        response: length-1,
                    });
                } else {
                    reject(this.buildErrorResponse(500, "internal error"));
                }
            }, Math.floor(Math.random() * 10) * 100)
        });
    }

    /**
     * Deletes the todolist at the given index
     * Generates an error if the index does not exist
     * 
     * @param listIndex The index of the list to be deleted
     * @returns An ApiResponseWrapper containing the true. An ApiResponseError if something went wrong
     */
    async deleteList(listIndex: number) : Promise<ApiResponseWrapper<boolean>> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this.isSuccess(this.successRate)) {
                    try {
                        if (listIndex < 0 || listIndex >= this.todos.length) {
                            reject(this.buildErrorResponse(400, "index out of bound"));
                        }
                        this.todos.splice(listIndex, 1);
                        fakeSocket.dispatchMessage({
                            type: "deleteList",
                            message: {
                                index: listIndex,
                            }
                        });
                        resolve({
                            response: true,
                        });
                    } catch(e) {
                        reject(this.buildErrorResponse(500, "internal error"));
                    }
                } else {
                    reject(this.buildErrorResponse(500, "internal error"));
                }
            }, Math.floor(Math.random() * 10) * 100)
        });
    }

    /**
     * Adds a todo item to a list
     * 
     * @param listIndex The index of the list to which the item must be added
     * @param item The item to add
     * @returns An ApiResponseWrapper containing the true. An ApiResponseError if something went wrong
     */
     async addTodo(listIndex: number, item: Todo) : Promise<ApiResponseWrapper<boolean>> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this.isSuccess(this.successRate)) {
                    try {
                        if (listIndex < 0 || listIndex >= this.todos.length) {
                            reject(this.buildErrorResponse(400, "index out of bound"));
                        }
                        // A real backend should validate that the item has the right format
                        this.todos[listIndex].items.push({...item});
                        fakeSocket.dispatchMessage({
                            type: "addToDo",
                            message: {
                                listIndex: listIndex,
                                item: {...item}
                            }
                        });
                        resolve({
                            response: true,
                        });
                    } catch(e) {
                        reject(this.buildErrorResponse(500, "internal error"));
                    }
                } else {
                    reject(this.buildErrorResponse(500, "internal error"));
                }
            }, Math.floor(Math.random() * 10) * 100)
        });
    }

    /**
     * Remove an item from a list
     * 
     * @param listIndex The index of the list from which the item must be removed
     * @param todoIndex The index of the item to be removed
     * @returns An ApiResponseWrapper containing the true. An ApiResponseError if something went wrong
     */
    async removeTodo(listIndex: number, todoIndex: number) : Promise<ApiResponseWrapper<boolean>> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this.isSuccess(this.successRate)) {
                    try {
                        if (listIndex < 0 || listIndex >= this.todos.length || todoIndex < 0 || todoIndex >= this.todos[listIndex].items.length) {
                            reject(this.buildErrorResponse(400, "index out of bound"));
                        }

                        this.todos[listIndex].items.splice(todoIndex, 1);
                        fakeSocket.dispatchMessage({
                            type: "removeTodo",
                            message: {
                                listIndex: listIndex,
                                itemIndex: todoIndex
                            }
                        });
                        resolve({
                            response: true,
                        });
                    } catch(e) {
                        reject(this.buildErrorResponse(500, "internal error"));
                    }
                } else {
                    reject(this.buildErrorResponse(500, "internal error"));
                }
            }, Math.floor(Math.random() * 10) * 100)
        });
    }

    /**
     * 
     * @param listIndex The index of the list from which the item must be removed
     * @param sourceIndex The source index of the item to be moved
     * @param destIndex The destination index of the item to be moved
     * @returns An ApiResponseWrapper containing the true. An ApiResponseError if something went wrong
     */
    async moveTodo(listIndex: number, sourceIndex: number, destIndex: number) : Promise<ApiResponseWrapper<boolean>> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this.isSuccess(this.successRate)) {
                    try {
                        if (listIndex < 0 || listIndex >= this.todos.length || sourceIndex < 0 || sourceIndex >= this.todos[listIndex].items.length) {
                            reject(this.buildErrorResponse(400, "index out of bound"));
                        }
                        const todo = this.todos[listIndex].items.splice(sourceIndex, 1);
                        const realDest = destIndex < sourceIndex ? destIndex : destIndex - 1;
                        this.todos[listIndex].items.splice(realDest, 0, ...todo);
                        fakeSocket.dispatchMessage({
                            type: "moveTodo",
                            message: {
                                listIndex,
                                sourceIndex,
                                destIndex
                            }
                        });
                        resolve({
                            response: true,
                        });
                    } catch(e) {
                        reject(this.buildErrorResponse(500, "internal error"));
                    }
                } else {
                    reject(this.buildErrorResponse(500, "internal error"));
                }
            }, Math.floor(Math.random() * 10) * 100)
        });
    }

    /**
     * 
     * @param listIndex The index of the list from which the item must be removed
     * @param itemIndex The index of the item to be edited
     * @param newValue The new value of the todo
     * @returns An ApiResponseWrapper containing the true. An ApiResponseError if something went wrong
     */
     async editTodo(listIndex: number, itemIndex: number, newValue: Todo) : Promise<ApiResponseWrapper<boolean>> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this.isSuccess(this.successRate)) {
                    try {
                        if (listIndex < 0 || listIndex >= this.todos.length || itemIndex < 0 || itemIndex >= this.todos[listIndex].items.length) {
                            reject(this.buildErrorResponse(400, "index out of bound"));
                        }
                        this.todos[listIndex].items[itemIndex] = {...newValue};
                        fakeSocket.dispatchMessage({
                            type: "editTodo",
                            message: {
                                listIndex,
                                itemIndex,
                                newValue
                            }
                        });
                        resolve({
                            response: true,
                        });
                    } catch(e) {
                        reject(this.buildErrorResponse(500, "internal error"));
                    }
                } else {
                    reject(this.buildErrorResponse(500, "internal error"));
                }
            }, Math.floor(Math.random() * 10) * 100)
        });
    }
}

export default new TodoApi();