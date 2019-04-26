import Dockerode from 'dockerode';

export function buildImage(imageName: string): Promise<any> {
  const docker = new Dockerode();
  return new Promise((resolve, reject) => {
    docker.buildImage(
      {
        context: './',
        src: ['Dockerfile']
      },
      {
        t: imageName
      },
      function(error, stream) {
        if (error) {
          reject(error);
        }
        if (stream) {
          stream.resume();
          stream.on('end', function() {
            resolve();
          });
        }
      }
    );
  });
}
