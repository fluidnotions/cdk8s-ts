import { Construct } from 'constructs';
import { App, Chart, ChartProps } from 'cdk8s';
import { WebService, WebServiceProps } from './lib/web-service';


export class MyChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    const camWebServiceProps: WebServiceProps = {
       namespace: 'support',
       image: 'camunda/camunda-bpm-platform:7.20.0-SNAPSHOT',
       containerEnv: [{
          name: 'DB_URL',
          value: 'jdbc:h2:/camunda/data'
       }],
       pvc: {
          pvcName: 'camunda-data',
          containerMountPath: '/camunda/data'
       }
    }

    new WebService(this, 'camunda-bpm-platform_7_20', camWebServiceProps);
   

  }
}

const app = new App();
new MyChart(app, 'support');
app.synth();