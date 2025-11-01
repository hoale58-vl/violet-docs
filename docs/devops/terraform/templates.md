# Templates

Production-ready Terraform configurations for common cloud infrastructure patterns.

---

## GCP Cloud Storage Bucket

### Basic GCS Bucket

```hcl
# variables.tf
variable "domains" {
  type = list(string)
  default = [
    "staging.violet.xyz"
  ]
}

# storage.tf
resource "google_storage_bucket" "static_sites" {
  for_each      = toset(var.domains)
  name          = each.value
  location      = "US"
  storage_class = "STANDARD"
  force_destroy = true

  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }

  uniform_bucket_level_access = true
}

resource "google_storage_bucket_iam_member" "public_access" {
  for_each = google_storage_bucket.static_sites
  bucket   = each.value.name
  role     = "roles/storage.objectViewer"
  member   = "allUsers"
}

resource "google_storage_bucket" "db-backup" {
  name          = "nexm-db-backup"
  location      = "US"
  storage_class = "STANDARD"

  uniform_bucket_level_access = true
}

```

### GCS Static Website with Cloud CDN

```hcl
# variables.tf
variable "cdn_domains" {
  type = list(string)
  default = [
    "staging.violet.xyz"
  ]
}

# storage.tf
# Backend bucket linked to Cloud CDN
resource "google_compute_backend_bucket" "cdn_backend" {
  for_each    = toset(var.cdn_domains)
  name        = replace("${each.value}-backend", ".", "-")
  bucket_name = google_storage_bucket.static_sites[each.value].name
  enable_cdn  = true
  cdn_policy {
    cache_mode       = "CACHE_ALL_STATIC"
    default_ttl      = 300
    max_ttl          = 3600
    client_ttl       = 300
    negative_caching = false
  }
}

# URL map
resource "google_compute_url_map" "cdn_url_map" {
  for_each        = toset(var.cdn_domains)
  name            = replace("${each.value}-urlmap", ".", "-")
  default_service = google_compute_backend_bucket.cdn_backend[each.value].id
}

# Managed SSL certificate
resource "google_compute_managed_ssl_certificate" "cdn_ssl" {
  for_each = toset(var.cdn_domains)
  name     = replace("${each.value}-ssl", ".", "-")
  managed {
    domains = [each.value]
  }
}

# HTTPS proxy
resource "google_compute_target_https_proxy" "cdn_https_proxy" {
  for_each = toset(var.cdn_domains)

  name             = replace("${each.value}-https-proxy", ".", "-")
  ssl_certificates = [google_compute_managed_ssl_certificate.cdn_ssl[each.value].id]
  url_map          = google_compute_url_map.cdn_url_map[each.value].id
}

# Global static IP
resource "google_compute_global_address" "cdn_ip" {
  for_each = toset(var.cdn_domains)
  name     = replace("${each.value}-ip", ".", "-")
}

# Forwarding rule
resource "google_compute_global_forwarding_rule" "cdn_forwarding_rule" {
  for_each = toset(var.cdn_domains)
  name     = replace("${each.value}-https-rule", ".", "-")

  target                = google_compute_target_https_proxy.cdn_https_proxy[each.value].id
  port_range            = "443"
  ip_address            = google_compute_global_address.cdn_ip[each.value].address
  load_balancing_scheme = "EXTERNAL"
}

# outputs.tf
output "cdn_ip" {
  description = "Public IPs for each CDN domain. Point your domain A record to the corresponding IP."
  value = {
    for domain, addr in google_compute_global_address.cdn_ip :
    domain => addr.address
  }
}
```

---

## GCP GKE Cluster

Production-ready GKE cluster with autopilot or standard mode.

### GKE Autopilot Cluster

```hcl
resource "google_container_cluster" "autopilot" {
  name     = var.cluster_name
  location = var.region
  project  = var.project_id

  # Enable Autopilot
  enable_autopilot = true

  network    = var.network
  subnetwork = var.subnetwork

  ip_allocation_policy {
    cluster_ipv4_cidr_block  = "/16"
    services_ipv4_cidr_block = "/22"
  }

  # Workload Identity
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  # Logging and monitoring
  logging_config {
    enable_components = ["SYSTEM_COMPONENTS", "WORKLOADS"]
  }

  monitoring_config {
    enable_components = ["SYSTEM_COMPONENTS"]
    managed_prometheus {
      enabled = true
    }
  }

  # Maintenance window
  maintenance_policy {
    daily_maintenance_window {
      start_time = "03:00"
    }
  }
}
```

---

## Tags

`terraform`, `iac`, `templates`, `aws`, `gcp`, `eks`, `gke`, `s3`, `cdn`, `kubernetes`

---

*Last updated: 2025-10-31*
