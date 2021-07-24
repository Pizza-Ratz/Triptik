# Triptik

A caching proxy server that gives Rides access to Google's Directions API.

## Use

### Directions Endpoint

`/api/v1/directions?start=lat,lon&end=lat,lon`

Returns whatever Google's Directions API returns. Layer 7 load balancer routes `/api/v1` to us.

### Healtz

`/healthz`

Used by Kubernetes to judge liveness of container -- tests DB connection to make sure that it's still good. Not accessible from outside of our VPC.

### /

Used by load balancer to test health of service. Not accessible from outside of our VPC.

## Cache

The cache uses a deadline approach that evicts any entry that's more than 30 minutes old. The deadline may need to be updated, or a cheaper solution found, if we start doing real-time trips at some point.
