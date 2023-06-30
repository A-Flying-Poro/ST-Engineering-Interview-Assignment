import morgan from "morgan";

import Logger from "./logger";

const morganLogger = morgan(
    ':method :url :status :res[content-length] - :response-time ms',
    {
        stream: {
            // Use the http severity
            write: (message) => Logger.http(message),
        }
    }
)

export default morganLogger
