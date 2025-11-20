environment  = "staging"
region       = "us-central1"
zones        = ["us-central1-a", "us-central1-b", "us-central1-c"]

# Mirror production size for staging
api_node_count  = 3
api_min_nodes   = 3
api_max_nodes   = 8
api_machine_type = "n2-standard-2"

worker_node_count  = 2
worker_min_nodes   = 2
worker_max_nodes   = 8
worker_machine_type = "n2-standard-2"

cache_node_count  = 3
cache_min_nodes   = 3
cache_max_nodes   = 5
cache_machine_type = "n2-highmem-2"

# Production-like database
db_tier      = "db-custom-2-7680"
db_disk_size = 100

release_channel = "REGULAR"
