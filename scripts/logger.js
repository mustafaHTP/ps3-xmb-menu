const LOG_TYPE = {
    INFO: 'INFO',
    ERROR: 'ERROR',
    WARNING: 'WARNING'
}

function log(type, message) {
    console.log(`[${type}]: ${message}`);
}

export {log, LOG_TYPE};