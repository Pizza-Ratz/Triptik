# Triptik

A caching proxy server that gives Rides access to Google's Directions API.

## Cache

The cache uses a deadline approach that evicts any entry that's more than 30 minutes old. The deadline may need to be updated, or a cheaper solution found, if we start doing real-time trips
at some point.
