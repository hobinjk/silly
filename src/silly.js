import { kMeans, silhouette, distanceSquared, distance } from "./kmeans";
const width = 480;
const height = 480;

const points = generatePoints();
function generatePoints() {
  let points = [];
  for (let i = 0; i < 100; i++) {
    points.push({
      x: 100 + Math.random() * 100,
      y: 100 + Math.random() * 100,
      z: 0,
    });
    points.push({
      x: 300 + Math.random() * 100,
      y: 100 + Math.random() * 100,
      z: 0,
    });
    points.push({
      x: 200 + Math.random() * 50,
      y: 300 + Math.random() * 50,
      z: 0,
    });
    for (let j = 0; j < 3; j++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: 0,
      });
    }
  }
  return points;
}

const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
document.body.appendChild(canvas);

const gfx = canvas.getContext('2d');

let bestClusters = null;
let bestScore = -100;

for (let k = 2; k < 5; k++) {
  let clusters = kMeans(k, points);
  let score = silhouette(points, clusters);
  console.log(score, k);
  if (score > bestScore) {
    bestScore = score;
    bestClusters = clusters;
  }
}
bestClusters = kMeans(bestClusters.length, points);

gfx.fillStyle = 'white';
gfx.fillRect(0, 0, width, height);

let colors = [
  'red',
  'green',
  'blue',
  'yellow',
  'orange',
  'grey',
];

for (let i = 0; i < bestClusters.length; i++) {
  let center = bestClusters[i];
  let dists = [];
  let avgDist = 0;
  for (let point of points) {
    if (point.cluster !== i) {
      continue;
    }
    dists.push(distanceSquared(point, center));
    avgDist += distance(point, center);
  }
  avgDist /= dists.length;
  dists.sort((a, b) => a - b);
  console.log(dists);
  let medDist = avgDist * avgDist; // dists[Math.floor(2 * dists.length / 3)];
  for (let point of points) {
    if (point.cluster !== i) {
      continue;
    }
    if (distanceSquared(point, center) > medDist) {
      point.cluster = 5;
    }
  }
}

for (let point of points) {
  gfx.fillStyle = colors[point.cluster];
  gfx.beginPath();
  gfx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
  gfx.fill();
}

for (let i = 0; i < bestClusters.length; i++) {
  let point = bestClusters[i];
  gfx.fillStyle = 'black';
  gfx.beginPath();
  gfx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
  gfx.fill();
}
