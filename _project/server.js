const http = require('http');
const fs = require('fs');
const path = require('path');

// Path to JSON file simulating a database
const dataFile = path.join(__dirname, 'recommendations.json');

// Ensure the data file exists
if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify([])); // Initialize as an empty array
}

// Read data from JSON file
function readRecommendations() {
    const rawData = fs.readFileSync(dataFile, 'utf-8');
    return JSON.parse(rawData);
}

// Save data to JSON file
function saveRecommendations(data) {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// Create the server
http.createServer((req, res) => {
    if (req.url === '/recommendations' && req.method === 'GET') {
        // Return the recommendation list
        const recommendations = readRecommendations();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(recommendations));
    } else if (req.url === '/add-recommendation' && req.method === 'POST') {
        // Add a new recommendation
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const newRecommendation = JSON.parse(body);
                const recommendations = readRecommendations();
                recommendations.push(newRecommendation);
                saveRecommendations(recommendations);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Recommendation added successfully' }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Invalid data format' }));
            }
        });
    } else {
        // Serve static files
        const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
            } else {
                const ext = path.extname(filePath);
                const contentType = ext === '.html' ? 'text/html' :
                                    ext === '.css' ? 'text/css' :
                                    ext === '.js' ? 'application/javascript' :
                                    'text/plain';

                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            }
        });
    }
}).listen(3000, () => console.log('Server running at http://localhost:3000/'));
