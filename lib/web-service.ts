import { Construct } from 'constructs';
import { Names } from 'cdk8s';
import { KubeDeployment, KubeService, IntOrString, Quantity, KubePersistentVolumeClaim, EnvVar, KubeDeploymentProps } from '../imports/k8s';
import { set } from 'lodash';

export interface WebServiceProps {
  readonly namespace: string;
  /**
   * The Docker image to use for this service.
   */
  readonly image: string;
  // readonly replicas: number;
  /**
   * External port.
   *
   * @default 80
   */
  readonly port?: number;

  /**
   * Internal port.
   *
   * @default 8080
   */
  readonly containerPort?: number;

  readonly containerEnv?: EnvVar[];

  readonly pvc?: {
    pvcName: string;
    containerMountPath: string;
    storageClassName?: string;
  }

}

export class WebService extends Construct {
  constructor(scope: Construct, id: string, props: WebServiceProps) {
    super(scope, id);

    const port = props.port || 80;
    const containerPort = props.containerPort || 8080;
    const label = { app: Names.toDnsLabel(this) };
    const replicas = 1;
    const namespace = props.namespace;
    const storageClassName = props.pvc?.storageClassName ?? "microk8s-hostpath"
    const containerEnv =  props.containerEnv ?? []
    const namePrefix = id

    new KubeService(this, 'service', {
      metadata: { namespace, name: `${namePrefix}-service` },
      spec: {
        type: 'ClusterIP',
        ports: [ { port, targetPort: IntOrString.fromNumber(containerPort) } ],
        selector: label
      }
    });
    const deployment: KubeDeploymentProps = {
      metadata: { namespace, name: `${namePrefix}-deployment` },
      spec: {
        replicas,
       
        selector: {
          matchLabels: label
        },
        template: {
          metadata: { labels: label },
          spec: {
            containers: [
              {
                name: 'app',
                image: props.image,
                ports: [ { containerPort } ],
                env: containerEnv
              }
            ]
          }
        }
      }
    }
    if(props.pvc){
      new KubePersistentVolumeClaim(this, 'pvc', {
        metadata: {
          name: props.pvc.pvcName!,
          namespace: namespace,
          annotations: {associatedDeployment: `${namePrefix}-deployment`}
        },
        spec: {
          accessModes: ['ReadWrite'],
          storageClassName: storageClassName,
          resources: { requests: { storage:  Quantity.fromString('1Gi')} }
        },
      });
      set(deployment, 'spec.template.spec.volumes', [
        {
          name: 'data',
          persistentVolumeClaim: {
            claimName: props.pvc.pvcName
          }
        }
      ])
      set(deployment, 'spec.template.spec.containers[0].volumeMounts[0].mountPath', props.pvc.containerMountPath)
    }
    new KubeDeployment(this, 'deployment', deployment);
  }
}