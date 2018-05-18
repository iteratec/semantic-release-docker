import { Logger } from "../../typings/semantic-release";

interface NextRelease {
  version: string;
}

export interface PrepareParams {
  nextRelease: NextRelease;
  logger: Logger;
}
