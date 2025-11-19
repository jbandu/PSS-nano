variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "pss-nano"
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "zones" {
  description = "GCP zones for multi-zone deployment"
  type        = list(string)
  default     = ["us-central1-a", "us-central1-b", "us-central1-c"]
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

# Network Configuration
variable "subnet_cidr" {
  description = "CIDR range for GKE subnet"
  type        = string
  default     = "10.0.0.0/20"
}

variable "pods_cidr" {
  description = "CIDR range for pods"
  type        = string
  default     = "10.4.0.0/14"
}

variable "services_cidr" {
  description = "CIDR range for services"
  type        = string
  default     = "10.8.0.0/20"
}

variable "master_cidr" {
  description = "CIDR range for GKE master"
  type        = string
  default     = "172.16.0.0/28"
}

variable "master_authorized_networks" {
  description = "Networks authorized to access GKE master"
  type = list(object({
    cidr_block   = string
    display_name = string
  }))
  default = [
    {
      cidr_block   = "0.0.0.0/0"
      display_name = "All"
    }
  ]
}

# GKE Configuration
variable "release_channel" {
  description = "GKE release channel"
  type        = string
  default     = "REGULAR"
}

variable "enable_autopilot" {
  description = "Enable GKE Autopilot mode"
  type        = bool
  default     = false
}

# API Node Pool
variable "api_node_count" {
  description = "Initial number of nodes in API pool"
  type        = number
  default     = 3
}

variable "api_min_nodes" {
  description = "Minimum number of nodes in API pool"
  type        = number
  default     = 3
}

variable "api_max_nodes" {
  description = "Maximum number of nodes in API pool"
  type        = number
  default     = 10
}

variable "api_machine_type" {
  description = "Machine type for API nodes"
  type        = string
  default     = "n2-standard-2"
}

# Worker Node Pool
variable "worker_node_count" {
  description = "Initial number of nodes in worker pool"
  type        = number
  default     = 2
}

variable "worker_min_nodes" {
  description = "Minimum number of nodes in worker pool"
  type        = number
  default     = 2
}

variable "worker_max_nodes" {
  description = "Maximum number of nodes in worker pool"
  type        = number
  default     = 10
}

variable "worker_machine_type" {
  description = "Machine type for worker nodes"
  type        = string
  default     = "n2-standard-2"
}

# Cache Node Pool
variable "cache_node_count" {
  description = "Initial number of nodes in cache pool"
  type        = number
  default     = 3
}

variable "cache_min_nodes" {
  description = "Minimum number of nodes in cache pool"
  type        = number
  default     = 3
}

variable "cache_max_nodes" {
  description = "Maximum number of nodes in cache pool"
  type        = number
  default     = 6
}

variable "cache_machine_type" {
  description = "Machine type for cache nodes"
  type        = string
  default     = "n2-highmem-2"
}

# Cloud SQL Configuration
variable "db_tier" {
  description = "Cloud SQL instance tier"
  type        = string
  default     = "db-custom-2-7680"
}

variable "db_disk_size" {
  description = "Database disk size in GB"
  type        = number
  default     = 100
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "airlineops"
  sensitive   = true
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "replica_region" {
  description = "Region for database read replica"
  type        = string
  default     = "us-east1"
}

# Security
variable "blocked_ip_ranges" {
  description = "IP ranges to block in Cloud Armor"
  type        = list(string)
  default     = []
}
