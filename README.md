# @iteratec/semantic-release-docker

A [semantic-release](https://github.com/semantic-release/semantic-release) plugin to use semantic versioning for docker images.

## verifyConditions

The _verifyConditions_ phase verifies that environment variables for authentication via username and password are set.
It uses a registry server provided via config or environment variable (preferred) or defaults to docker hub if none is given.
It also verifies that the credentials are correct by logging in to the given registry.

## prepare

The _prepare_ phase tags the specified image with the version number determined by semantic-release and additional tags provided in the configuration.
In addition it supports specifying a complete image name (CIN) via configuration settings according to the canonical format specified by docker:

`[registryhostname[:port]/][username/]imagename[:tag]`