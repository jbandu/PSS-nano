environment  = "prod"
region       = "us-central1"
zones        = ["us-central1-a", "us-central1-b", "us-central1-c"]

# Production node pools
api_node_count  = 3
api_min_nodes   = 3
api_max_nodes   = 10
api_machine_type = "n2-standard-4"

worker_node_count  = 2
worker_min_nodes   = 2
worker_max_nodes   = 10
worker_machine_type = "n2-standard-4"

cache_node_count  = 3
cache_min_nodes   = 3
cache_max_nodes   = 6
cache_machine_type = "n2-highmem-4"

# Production database with high availability
db_tier      = "db-custom-4-15360"
db_disk_size = 200

replica_region = "us-east1"

release_channel = "REGULAR"

# Security - restrict master access in production
master_authorized_networks = [
  {
    cidr_block   = "10.0.0.0/8"
    display_name = "Internal"
  }
]
