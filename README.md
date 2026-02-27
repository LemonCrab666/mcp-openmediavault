# mcp-openmediavault

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server for **OpenMediaVault (OMV)**, providing AI assistants with full access to NAS storage, shares, users, and system management through the OMV JSON-RPC API.

Compatible with **OMV 5 and OMV 6**.

## Features

**33 tools** across five categories:

### System
| Tool | Description |
|------|-------------|
| `get_system_info` | Hostname, version, CPU model, uptime, memory |
| `get_system_stats` | CPU usage, memory usage, load averages |
| `get_cpu_temp` | CPU temperature readings |
| `get_network_interfaces` | Network interfaces with IP, netmask, gateway, speed |
| `get_system_log` | Syslog entries |
| `get_power_management` | Scheduled shutdown, wake-on-LAN settings |

### Storage
| Tool | Description |
|------|-------------|
| `list_disks` | Physical disks with model, vendor, size, serial, temperature, SMART status |
| `list_filesystems` | Filesystems with type, label, size, usage, mount status |
| `get_mounted_filesystems` | Currently mounted filesystems with usage stats |
| `get_smart_info` | SMART attributes for a disk |
| `get_smart_extended_info` | Extended SMART info including self-test results |
| `get_smart_device_settings` | SMART monitoring settings per disk |
| `list_smart_jobs` | Scheduled SMART self-test jobs |
| `list_raid_devices` | Software RAID (mdadm) devices |

### Shares
| Tool | Description |
|------|-------------|
| `list_shared_folders` | Shared folders with filesystem references and privileges |
| `get_shared_folder_privileges` | User/group access privileges for a shared folder |
| `list_smb_shares` | SMB/CIFS (Samba/Windows) shares |
| `get_smb_settings` | Global SMB service settings |
| `list_nfs_shares` | NFS shares with client and export options |
| `get_nfs_settings` | Global NFS service settings |
| `list_ftp_shares` | FTP shares |
| `get_ftp_settings` | Global FTP service settings |

### Users & Groups
| Tool | Description |
|------|-------------|
| `list_users` | Local user accounts with UID, GID, groups |
| `get_user` | Detailed info about a specific user |
| `list_groups` | Local groups with GID, comment, members |
| `get_group` | Detailed info about a specific group |
| `enumerate_users` | All system users including system accounts |
| `enumerate_groups` | All system groups |
| `get_user_privileges` | Shared folder privileges for a user |

### Services
| Tool | Description |
|------|-------------|
| `get_services_status` | Status of all services (SMB, NFS, SSH, FTP, rsync, etc.) |
| `list_cron_jobs` | Scheduled cron jobs with command and schedule |
| `get_ssh_settings` | SSH service settings |
| `list_rsync_jobs` | Rsync backup/sync jobs |
| `list_rsync_modules` | Rsync daemon modules |
| `get_rsync_settings` | Global rsync settings |
| `get_notification_settings` | Email notification settings |
| `get_updates` | Available software updates |
| `list_plugins` | Installed OMV plugins |
| `get_watchdog_settings` | Hardware watchdog timer settings |

## Installation

```bash
git clone git@github.com:fredriksknese/mcp-openmediavault.git
cd mcp-openmediavault
npm install
npm run build
```

## Configuration

The server is configured via environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OMV_HOST` | Yes | — | OMV server hostname or IP address |
| `OMV_USERNAME` | No | `admin` | OMV admin username |
| `OMV_PASSWORD` | Yes | — | OMV admin password |
| `OMV_ALLOW_SELF_SIGNED` | No | `true` | Accept self-signed SSL certificates |

## OMV 5 / OMV 6 Compatibility

The server connects to the JSON-RPC endpoint at `https://{host}/rpc.php`, which is the standard endpoint for both OMV 5 and OMV 6.

Session management follows the OMV protocol:
1. Login via `POST /rpc.php` with `Session.login`
2. Extract the session cookie (`PHPSESSID`) from the `Set-Cookie` response header
3. Send both the `Cookie` header and `X-OPENMEDIAVAULT-SESSIONID` header on all subsequent requests

If the session expires (HTTP 401), the client automatically re-authenticates and retries.

## Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "openmediavault": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-openmediavault/dist/index.js"],
      "env": {
        "OMV_HOST": "192.168.1.100",
        "OMV_USERNAME": "admin",
        "OMV_PASSWORD": "your-password"
      }
    }
  }
}
```

## Usage with Claude Code

```bash
claude mcp add openmediavault -- node /absolute/path/to/mcp-openmediavault/dist/index.js
```

Set environment variables before running, or configure them in your MCP settings.

## Example Prompts

Once connected, you can ask your AI assistant things like:

- *"What is the current disk usage and which filesystems are mounted?"*
- *"Show me the SMART health status for all disks"*
- *"List all SMB shares and their enabled status"*
- *"What services are currently running on the NAS?"*
- *"Show me all users and their group memberships"*
- *"Are there any software updates available for OMV?"*
- *"What cron jobs are scheduled and when do they run?"*
- *"Show me the NFS export configuration"*
- *"What is the CPU temperature and system load?"*

## Development

```bash
npm run dev      # Run with tsx (auto-reloads)
npm run build    # Compile TypeScript to dist/
npm start        # Run compiled output
```

## Architecture

```
src/
├── index.ts          # Entry point — creates MCP server + STDIO transport
├── omv-client.ts     # JSON-RPC client with session management and auto-retry
└── tools/
    ├── system.ts     # System info, stats, network interfaces (6 tools)
    ├── storage.ts    # Disks, filesystems, SMART, RAID (8 tools)
    ├── shares.ts     # Shared folders, SMB, NFS, FTP (8 tools)
    ├── users.ts      # Users and groups (7 tools)
    └── services.ts   # Services status, cron, SSH, rsync, plugins (10 tools)
```

## Requirements

- Node.js 18+
- OpenMediaVault 5 or 6 with admin credentials
- Admin account with API access (the default `admin` account works)

## License

SEE LICENSE IN LICENSE
