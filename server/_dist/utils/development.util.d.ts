import "reflect-metadata";
export declare enum LOG_LEVEL {
    INFO = "info",
    WARN = "warn",
    ERROR = "error",
    DEBUG = "debug"
}
export declare enum LOG_TYPE {
    SERVER = "server",
    MEMORY = "memory",
    ALL = "all",
    EXPRESS = "express"
}
export declare function isDevelopment(): boolean;
export declare function isDevelopmentFor(type: LOG_TYPE): any;
export declare function devLog(level?: LOG_LEVEL, type?: [LOG_TYPE] | LOG_TYPE, ...message: any[]): void;
//# sourceMappingURL=development.util.d.ts.map