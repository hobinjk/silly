const width = 480;
const height = 480;

const points = generatePoints();
function generatePoints() {
  let points = [];
  for (let i = 0; i < 100; i++) {
    points.push({
      x: 100 + Math.random() * 100,
      y: 100 + Math.random() * 100,
    });
    points.push({
      x: 300 + Math.random() * 100,
      y: 100 + Math.random() * 100,
    });
    points.push({
      x: 200 + Math.random() * 50,
      y: 300 + Math.random() * 50,
    });
    for (let j = 0; j < 3; j++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
      });
    }
  }
  return points;
}

function distance(a, b) {
  return Math.sqrt((a.x - b.x) * (a.x - b.x) +
    (a.y - b.y) * (a.y - b.y));
}

function distanceSquared(a, b) {
  return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
}

function getCluster(centers, point) {
  let minDistSq = Number.MAX_VALUE;
  let mdIndex = 0;
  for (let i = 0; i < centers.length; i++) {
    let center = centers[i];
    let distSq = distanceSquared(point, center);
    if (distSq < minDistSq) {
      minDistSq = distSq;
      mdIndex = i;
    }
  }
  return mdIndex;
}

function getClusterCenter(cluster, points) {
  let x = 0;
  let y = 0;
  let count = 0;
  for (let point of points) {
    if (point.cluster !== cluster) {
      continue;
    }
    x += point.x;
    y += point.y;
    count += 1;
  }
  return {
    x: x / count,
    y: y / count,
  };
}

function kMeans(k, points) {
  let centers = [];
  let usedAsCenter = {};

  while (centers.length < k) {
    let idx = Math.round(Math.random() * points.length);
    // k means++ improvement (weighting by distance to current clusters)
    if (centers.length > 0) {
      let weights = new Array(points.length);
      let totalWeight = 0;
      for (let i = 0; i < points.length; i++) {
        if (usedAsCenter[i]) {
          weights[i] = 0;
          continue;
        }
        let point = points[i];
        let weight = Number.MAX_VALUE;
        for (let center of centers) {
          weight = Math.min(weight, distanceSquared(point, center));
        }
        totalWeight += weight;
        weights[i] = weight;
      }

      let choice = Math.random() * totalWeight;
      for (let i = 0; i < weights.length; i++) {
        if (choice <= weights[i]) {
          idx = i;
          break;
        }
        choice -= weights[i];
      }
    }
    if (usedAsCenter[idx]) {
      continue;
    }
    usedAsCenter[idx] = true;
    let point = points[idx];
    centers.push({
      x: point.x,
      y: point.y,
    });
  }

  let converged = false;
  while (!converged) {
    converged = true;
    for (let point of points) {
      let newCluster = getCluster(centers, point);
      if (point.cluster !== newCluster) {
        converged = false;
      }
      point.cluster = newCluster;
    }

    if (converged) {
      return centers;
    }

    for (let i = 0; i < centers.length; i++) {
      centers[i] = getClusterCenter(i, points);
    }
  }
}

const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
document.body.appendChild(canvas);

const gfx = canvas.getContext('2d');

function silhouettePoint(point, clusters) {
  let distIn = distance(point, clusters[point.cluster]);
  let minDistOut = Number.MAX_VALUE;
  for (let i = 0; i < clusters.length; i++) {
    if (i === point.cluster) {
      continue;
    }
    minDistOut = Math.min(minDistOut, distance(point, clusters[i]));
  }
  return (minDistOut - distIn) / Math.max(minDistOut, distIn);
}

function silhouette(points, clusters) {
  let score = 0;
  for (let i = 0; i < points.length; i++) {
    score += silhouettePoint(points[i], clusters);
  }
  return score / points.length;
}

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
