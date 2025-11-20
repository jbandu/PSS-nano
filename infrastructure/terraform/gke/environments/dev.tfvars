environment  = "dev"
region       = "us-central1"
zones        = ["us-central1-a", "us-central1-b"]

# Smaller node pools for dev
api_node_count  = 2
api_min_nodes   = 2
api_max_nodes   = 4
api_machine_type = "n2-standard-2"

worker_node_count  = 1
worker_min_nodes   = 1
worker_max_nodes   = 3
worker_machine_type = "n2-standard-2"

cache_node_count  = 2
cache_min_nodes   = 2
cache_max_nodes   = 3
cache_machine_type = "n2-highmem-2"

# Smaller database for dev
db_tier      = "db-custom-1-3840"
db_disk_size = 50

release_channel = "RAPID"
