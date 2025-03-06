export function distance(a, b) {
  return Math.sqrt((a.x - b.x) * (a.x - b.x) +
    (a.y - b.y) * (a.y - b.y) +
    (a.z - b.z) * (a.z - b.z));
}

export function distanceSquared(a, b) {
  return (a.x - b.x) * (a.x - b.x) +
    (a.y - b.y) * (a.y - b.y) +
    (a.z - b.z) * (a.z - b.z);
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
  let z = 0;
  let count = 0;
  for (let point of points) {
    if (point.cluster !== cluster) {
      continue;
    }
    x += point.x;
    y += point.y;
    z += point.z;
    count += 1;
  }
  return {
    x: x / count,
    y: y / count,
    z: z / count,
  };
}

export function kMeans(k, points) {
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
      z: point.z,
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

export function silhouette(points, clusters) {
  let score = 0;
  for (let i = 0; i < points.length; i++) {
    score += silhouettePoint(points[i], clusters);
  }
  return score / points.length;
}

