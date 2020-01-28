# Simple Metrics

## Purpose
A simple web service for aggregating metrics using an in-memory data store.


## API

### Add a metric

URL: `POST /metric/KEY`
Body:
```
{ value?: Number }
```
Response:
```
{}
```

### Get the sum of a metric in the last hour

URL: `GET /metric/KEY/sum`
Response:
```
{ value?: Number }
```

## Design decisions

### MetricStore

The sum() function is responsible for adding all entries within the time window, and garbage collection of expired items.
Since it is O(N), it can grow to be inefficient when a lot of entries are added. 

One solution is to memoize the summation by partitioning the data into time segments. This will reduce the maximum number
of elements in the store to Time Window / Partition Size.

The default partitioning is per millisecond. 
A less granular partitioning (for ex. every 60s) will provide faster performance at the cost of time window precision.


## Requirements

Node.JS > 8

## Installation

`npm install`

## Server

`PORT=3000 node index.js`

### Example 
#### Add metrics
```
curl -H "Content-Type: application/json" -X POST -d '{"value": 33}' http://localhost:3000/metric/cpu
curl -H "Content-Type: application/json" -X POST -d '{"value": 50}' http://localhost:3000/metric/cpu
curl -H "Content-Type: application/json" -X POST -d '{"value": 75}' http://localhost:3000/metric/cpu
curl -H "Content-Type: application/json" -X POST -d '{"value": 190}' http://localhost:3000/metric/cpu
```

#### Get sum

```
curl http://localhost:3000/metric/cpu/sum
```


## Development 

### Linting

The AirBnB and Mocha ESLint styleguides are implemented.
`npm run lint`

### Testing
Mocha and Supertest are used for testing.
`npm test`

### Code Coverage
Corbetura is used for code coverage reporting.
`npm run coverage`
