const path = require('path');
const fs = require('fs');

const CONTENT_DIR = path.resolve(__dirname, '../src/content');

/**
 * Ensure that the content folder exists. This will stop the process if the folder does not exist.
 *
 * @param reporter
 */
const checkContentFolder = ({ reporter }) => {
  if (!fs.existsSync(CONTENT_DIR)) {
    reporter.panic(
      'Content folder does not exist, please run `git submodule update --init --remote --recursive` to download it'
    );
  }
};

module.exports = checkContentFolder;
