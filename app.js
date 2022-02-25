
/*
  SPECworkstation -- validateJson
  JSON schema validator for query.json and workload.json files
*/
const fs = require('fs');
const path = require('path');
const process = require('process');

const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });

// schema used https://json-schema.org/draft-04/schema#
const schemaFileDir = path.resolve(__dirname, 'reference_schema_files');
const schemaPaths = { 
    'query': path.resolve(schemaFileDir, 'query_schema.json'),
    'workload': path.resolve(schemaFileDir, 'workload_schema.json'),
};

// function to show help message and quit
const appName = path.basename(process.argv[0]);
function showHelp() {
    console.error(
        '### Help ###\n'
        + 'This application validates a query.json or a workload.json file based on the schema file.\n\n'
        + 'Usage:\n'
        + `  ${appName} --workload workload.json\n`
        + `  ${appName} --query query.json\n\n`
        + 'Note that workload.json and query.json should be the JSON file(s) being validated.'
    );
    process.exit(1);
}

// function to read JSON file
function getData(dataPath) {
    try {
        const fileData = fs.readFileSync(dataPath);
        const jsonData = JSON.parse(fileData);
        return jsonData;
    } catch (error) {
        console.error('Error: Unable to read/parse JSON file:\n', error);
        process.exit(1);
    }
}

// function to validate JSON data against schema
function validateFile(filePath, schemaType) {
    // validate provided JSON file exists
    if (!filePath.length) {
        console.error(`Error: Invalid value provided with --${schemaType} parameter.\n`);
        showHelp();
    }
    if (!fs.existsSync(filePath)) {
        console.error(`Error: Provided ${schemaType}.json file (${filePath}) does not exist.\n`);
        showHelp();
    }

    // reads query.json/workload.json and required schema file
    const filePathData = getData(filePath);
    const schemaFileData = getData(schemaPaths[schemaType]);

    const validator = ajv.compile(schemaFileData);
    if (!validator(filePathData)) {
        console.error(`Error: Provided ${path.basename(filePath)} file failed validation of ${schemaType} schema type:\n`, ajv.errorsText(validator.errors));
    } else {
        console.log(`Successfully validated ${schemaType} file: ${path.basename(filePath)}`);
    }
}

// main() -- entry point of the program (immediately executed)
(function () {
    // show help and exit if neither --query nor --workload were provided
    const queryIndex = process.argv.indexOf('--query');
    const workloadIndex = process.argv.indexOf('--workload');
    if (queryIndex < 0 && workloadIndex < 0) {
        showHelp();
    }

    // handle --query parameter
    if (queryIndex > -1) {
        const queryFile = process.argv[queryIndex + 1] ? process.argv[queryIndex + 1].trim() : '';
        validateFile(queryFile, 'query');
    }

    // handle --workload parameter
    if (workloadIndex > -1) {
        const workloadFile = process.argv[workloadIndex + 1] ? process.argv[workloadIndex + 1].trim() : '';
        validateFile(workloadFile, 'workload');
    }
})();
