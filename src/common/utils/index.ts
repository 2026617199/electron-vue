export const colors = {
    green: (content: string) => {
        return `\x1b[32m${content}\x1b[0m`
    },
    yellow: (content: string) => {
        return `\x1b[33m${content}\x1b[0m`
    },
    red: (content: string) => {
        return `\x1b[31m${content}\x1b[0m`
    },
    blue: (content: string) => {
        return `\x1b[34m${content}\x1b[0m`
    },
}