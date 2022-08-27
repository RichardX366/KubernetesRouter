# Tutorial

## Prerequisites

- Have a google cloud project with billing enabled (if this is your first cluster then it will be free)
- Have a cloudflare account
- Be able to pay at least $3.31 per year for a domain (cheapest renewal)

1. Go to (cosmotown)[https://cosmotown.com] and buy a domain
2. Set up the domain with cloudflare
3. Go onto Google Kubernetes Engine and create an autopilot cluster
4. Go to VPC network and reserve a **global** external static address (for steps 5 and 16; remember the address' name)
5. Go into cloudflare and change the DNS records to route all traffic to the static IP address (A records of @ and \*)
6. Go onto Google Cloud IAM and create a service account with Google Kubernetes Engine admin permissions
7. Download the key file for that service account
8. Minify the key file (here)[https://codebeautify.org/jsonminifier] (for step 11)
9. Create a new deployment on Google Kubernetes Engine
10. Set the image path to `richardx366/kubernetes-router:latest`
11. Set the environment variable `GKE_SERVICE_ACCOUNT_KEY` to the minified key
12. Set the environment variable `CLUSTER_NAME` to the Google Kubernetes Engine cluster name
13. Set the environment variable `HOST` to wherever you want to access the dashboard (e.g. `router.your-domain.com`)
14. Set the environment variable `PASSWORD` to the password you want to secure the dashboard with
15. Set the environment variable `COOKIE_SECRET` to the string you want to secure your dashboard cookies with (random string recommended as you don't have to remember it)
16. Set the environment variable `IP` to the name static IP address you reserved (e.g. `autopilot-ip`)
17. Deploy with the name `router` and wait for the ingress to be set up!
