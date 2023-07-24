import {MyChart} from './main';
import {Testing} from 'cdk8s';

describe('debugging', () => {

  test('check-synth-out', () => {
    const app = Testing.app();
    const chart = new MyChart(app, 'test-chart');
    const results = Testing.synth(chart)
    console.log(results)
  });

});
