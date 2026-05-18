const { spawn } = require('child_process');
const path = require('path');

/**
 * Calls the Python ML script to predict cardiovascular risk.
 * @param {Object} features - The user health features required by the model.
 * @returns {Promise<Object>} - The prediction result containing risk_category, score, and severity_mapped.
 */
const predictCardiovascularRisk = (features) => {
  return new Promise((resolve, reject) => {
    // Determine path to the python script
    const scriptPath = path.join(__dirname, '../ai/predict_cardio.py');
    
    // Attempt to run with 'python' first, fallback to 'python3' is typically handled outside,
    // but in a Node.js server env, 'python' is usually correct if virtualenv is activated.
    const pythonExecutable = process.env.PYTHON_PATH || 'python';
    
    const pyProcess = spawn(pythonExecutable, [scriptPath]);
    
    let resultData = '';
    let errorData = '';

    // Collect standard output
    pyProcess.stdout.on('data', (data) => {
      resultData += data.toString();
    });

    // Collect standard error
    pyProcess.stderr.on('data', (data) => {
      errorData += data.toString();
      // Uncomment for debugging python errors in the server logs:
      // console.error(`Python Stderr: ${data.toString()}`);
    });

    // Handle process close
    pyProcess.on('close', (code) => {
      if (code !== 0 && !resultData) {
        return reject(new Error(`Python process exited with code ${code}. Error: ${errorData}`));
      }
      
      try {
        // Find the JSON block in the output. TensorFlow often prints warning logs even when quiet.
        // We look for the last valid JSON string output by the python script.
        const lines = resultData.trim().split('\n');
        const jsonOutput = lines[lines.length - 1]; // The script prints JSON at the very end
        
        const parsed = JSON.parse(jsonOutput);
        
        if (parsed.status === 'error') {
          return reject(new Error(parsed.message || 'Error from Python AI script'));
        }
        
        resolve(parsed.prediction);
      } catch (err) {
        reject(new Error(`Failed to parse AI response. Raw output: ${resultData}. Parse Error: ${err.message}`));
      }
    });

    // Handle spawn error (e.g., python not installed)
    pyProcess.on('error', (err) => {
      reject(new Error(`Failed to start Python process: ${err.message}`));
    });

    // Send the features as JSON via standard input
    pyProcess.stdin.write(JSON.stringify(features));
    pyProcess.stdin.end();
  });
};

module.exports = {
  predictCardiovascularRisk
};
