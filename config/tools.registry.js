module.exports = {
  "subnet-calculator": {
    slug: "subnet-calculator",
    name: "Subnet Calculator",
    category: "Network",
    privacy: "client",
    desc: "Kalkulasi network address, broadcast, CIDR, dan usable host range.",
    usage: "Masukkan IPv4 address dan subnet mask/CIDR, klik Calculate.",
    template: "subnet-calculator"
  },
  "jwt-decoder": {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    category: "Security",
    privacy: "client",
    desc: "Decode header, payload, dan verifikasi klaim JWT token.",
    usage: "Paste JWT string ke input area, klik Decode.",
    template: "jwt-decoder"
  },
  "ssl-checker": {
    slug: "ssl-checker",
    name: "SSL/TLS Certificate Checker",
    category: "Security",
    privacy: "server",
    desc: "Cek masa berlaku, issuer, SAN, dan validitas SSL host remote.",
    usage: "Masukkan hostname/domain (contoh: example.com) dan port (443), klik Check.",
    template: "ssl-checker"
  },
  "password-generator": {
    slug: "password-generator",
    name: "Strong Password Generator",
    category: "Security",
    privacy: "client",
    desc: "Generate password acak aman berbasis Web Cryptography API.",
    usage: "Pilih panjang karakter & kombinasi simbol, klik Generate.",
    template: "password-generator"
  },
  "hash-generator": {
    slug: "hash-generator",
    name: "Hash Generator (MD5, SHA-256, SHA-512)",
    category: "Crypto",
    privacy: "client",
    desc: "Komputasi cryptographic checksum string/text.",
    usage: "Input teks sumber, pilih algoritma, hasil langsung terkomputasi.",
    template: "hash-generator"
  },
  "base64-converter": {
    slug: "base64-converter",
    name: "Base64 Encoder / Decoder",
    category: "Encoding",
    privacy: "client",
    desc: "Encode teks ke Base64 format atau sebaliknya.",
    usage: "Masukkan teks, pilih Encode atau Decode.",
    template: "base64-converter"
  },
  "url-encoder": {
    slug: "url-encoder",
    name: "URL Encoder / Decoder",
    category: "Encoding",
    privacy: "client",
    desc: "Standard RFC 3986 URI encoding/decoding.",
    usage: "Paste URL atau query string, klik Convert.",
    template: "url-encoder"
  },
  "json-formatter": {
    slug: "json-formatter",
    name: "JSON Formatter & Validator",
    category: "Formatter",
    privacy: "client",
    desc: "Validasi sintaks JSON, formatting indentasi, dan minifikasi.",
    usage: "Paste raw JSON, klik Format atau Minify.",
    template: "json-formatter"
  },
  "yaml-json-converter": {
    slug: "yaml-json-converter",
    name: "YAML <-> JSON Converter",
    category: "Converter",
    privacy: "client",
    desc: "Transformasi format config antara YAML dan JSON.",
    usage: "Masukkan YAML atau JSON, klik Convert.",
    template: "yaml-json-converter"
  },
  "dns-lookup": {
    slug: "dns-lookup",
    name: "DNS Record Resolver",
    category: "Network",
    privacy: "server",
    desc: "Resolve A, AAAA, MX, TXT, NS, CNAME records domain.",
    usage: "Ketik nama domain target, pilih record type, klik Resolve.",
    template: "dns-lookup"
  },
  "ping-test": {
    slug: "ping-test",
    name: "ICMP / TCP Ping",
    category: "Network",
    privacy: "server",
    desc: "Tes latensi dan reachability server endpoint.",
    usage: "Masukkan IP/domain target, klik Check.",
    template: "ping-test"
  },
  "port-checker": {
    slug: "port-checker",
    name: "Port Open Checker",
    category: "Network",
    privacy: "server",
    desc: "Deteksi port listening terbuka pada remote host.",
    usage: "Masukkan domain/IP dan nomor target port, klik Check.",
    template: "port-checker"
  },
  "whois-lookup": {
    slug: "whois-lookup",
    name: "WHOIS Domain Lookup",
    category: "Network",
    privacy: "server",
    desc: "Ambil informasi registrar, expiration, dan nameserver domain.",
    usage: "Ketik domain tanpa protokol (contoh: domain.id), klik Resolve.",
    template: "whois-lookup"
  },
  "crontab-generator": {
    slug: "crontab-generator",
    name: "Crontab Expression Generator",
    category: "DevOps",
    privacy: "client",
    desc: "Bangun dan terjemahkan cron schedule expression ke teks manusiawi.",
    usage: "Pilih interval waktu atau edit 5-part cron syntax langsung.",
    template: "crontab-generator"
  },
  "regex-tester": {
    slug: "regex-tester",
    name: "Regex Tester & Explainer",
    category: "DevOps",
    privacy: "client",
    desc: "Uji match pattern RegEx JavaScript secara real-time.",
    usage: "Tulis pattern RegEx, masukkan test string, klik Check.",
    template: "regex-tester"
  },
  "chmod-calculator": {
    slug: "chmod-calculator",
    name: "Linux Chmod Permissions Calculator",
    category: "DevOps",
    privacy: "client",
    desc: "Hitung nilai oktal/simbolik permission file Linux.",
    usage: "Centang checkbox r/w/x untuk Owner, Group, Public.",
    template: "chmod-calculator"
  },
  "uuid-generator": {
    slug: "uuid-generator",
    name: "UUID / GUID v4 Generator",
    category: "Crypto",
    privacy: "client",
    desc: "Generate bulk RFC 4122 compliant UUID v4.",
    usage: "Tentukan kuantitas UUID, klik Generate.",
    template: "uuid-generator"
  },
  "timestamp-converter": {
    slug: "timestamp-converter",
    name: "Epoch / Unix Timestamp Converter",
    category: "Converter",
    privacy: "client",
    desc: "Konversi Unix timestamp detik/milidetik ke UTC & waktu lokal.",
    usage: "Masukkan nilai Epoch atau tanggal ISO, klik Convert.",
    template: "timestamp-converter"
  },
  "curl-builder": {
    slug: "curl-builder",
    name: "cURL Command Builder",
    category: "DevOps",
    privacy: "client",
    desc: "UI GUI generator perintah curl HTTP request lengkap.",
    usage: "Isi HTTP method, URL, headers, dan payload body.",
    template: "curl-builder"
  },
  "sql-formatter": {
    slug: "sql-formatter",
    name: "SQL Formatter & Beautifier",
    category: "Formatter",
    privacy: "client",
    desc: "Indentasi query SQL standar ANSI / PostgreSQL / MySQL.",
    usage: "Paste raw SQL statement, klik Format.",
    template: "sql-formatter"
  },
  "markdown-previewer": {
    slug: "markdown-previewer",
    name: "Markdown Live Previewer",
    category: "Formatter",
    privacy: "client",
    desc: "Render syntax CommonMark / GFM Markdown.",
    usage: "Tulis syntax Markdown di panel kiri, output tampil di panel kanan.",
    template: "markdown-previewer"
  },
  "diff-checker": {
    slug: "diff-checker",
    name: "Text Diff Checker",
    category: "Formatter",
    privacy: "client",
    desc: "Bandingkan perbedaan baris/karakter dua blok teks.",
    usage: "Paste Original Text dan Modified Text, klik Check.",
    template: "diff-checker"
  },
  "ip-lookup": {
    slug: "ip-lookup",
    name: "Public IP & GeoIP Lookup",
    category: "Network",
    privacy: "server",
    desc: "Lookup lokasi geografis, ASN, dan ISP public IP.",
    usage: "Isi IPv4/IPv6 publik atau klik Use My IP.",
    template: "ip-lookup"
  },
  "http-status-checker": {
    slug: "http-status-checker",
    name: "HTTP Header & Status Checker",
    category: "Network",
    privacy: "server",
    desc: "Inspeksi response HTTP status code, redirect chain, & headers.",
    usage: "Input URL lengkap (https://...), klik Check.",
    template: "http-status-checker"
  },
  "docker-run-converter": {
    slug: "docker-run-converter",
    name: "Docker Run to Docker Compose Converter",
    category: "DevOps",
    privacy: "client",
    desc: "Ubah perintah inline docker run menjadi file compose.yaml.",
    usage: "Paste raw command docker run, klik Convert.",
    template: "docker-run-converter"
  }
};
