export interface ElosContextType {
    isBlocking: boolean;
    Blocking(): void;
    Unblocking(): void;
    RemoveEmptyFields(data: any): void,
    ShowValidateMessages(response: any): void,
}