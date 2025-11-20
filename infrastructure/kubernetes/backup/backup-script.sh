#!/bin/bash

# Velero backup script for PSS-nano
# Usage: ./backup-script.sh [backup-name]

set -e

BACKUP_NAME=${1:-manual-backup-$(date +%Y%m%d-%H%M%S)}
NAMESPACE="pss-nano"

echo "Creating backup: $BACKUP_NAME"

# Create backup
velero backup create $BACKUP_NAME \
  --include-namespaces $NAMESPACE \
  --include-cluster-resources=true \
  --default-volumes-to-fs-backup \
  --wait

# Check backup status
velero backup describe $BACKUP_NAME

# Verify backup
velero backup logs $BACKUP_NAME

echo "Backup completed: $BACKUP_NAME"
echo ""
echo "To restore this backup:"
echo "velero restore create --from-backup $BACKUP_NAME"
