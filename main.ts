import * as kplus from 'cdk8s-plus-26';
import * as cdk8s from 'cdk8s';

const app = new cdk8s.App();
const chart = new cdk8s.Chart(app, 'Chart');

new kplus.Deployment(chart, 'Deployment', {
  replicas: 1,
  containers: [{
    image: 'ubuntu',
  }],
});

app.synth();