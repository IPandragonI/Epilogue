export interface MistralResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
};