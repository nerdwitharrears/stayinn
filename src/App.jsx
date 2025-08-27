import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Building2,
  BedDouble,
  Users,
  Receipt,
  IndianRupee,
  Search,
  Plus,
  TrendingUp,
  MoonStar,
  Sun,
  Laptop
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";

// Prefer SF Pro on Apple devices; fall back elsewhere.
const sfProClass =
  "font-['SF Pro Text','SF Pro Display',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,Ubuntu,'Helvetica Neue',Arial,'Noto Sans',sans-serif]";

const baseURL = ""; // set to your API base when ready

async function apiGet(path) {
  if (!baseURL) return mockGet(path);
  const res = await fetch(baseURL + path);
  return res.json();
}

// Mock data to showcase the UI
function mockGet(path) {
  if (path === "/metrics") {
    return Promise.resolve({
      hostels: 5,
      rooms: 27,
      beds: 86,
      tenants: 142,
      occupancy: 0.78,
      monthlyBilled: 342000,
      monthlyPaid: 271500,
      dues: 70500
    });
  }
  if (path.startsWith("/revenue/monthly")) {
    const data = Array.from({ length: 12 }).map((_, i) => ({
      month: new Date(2025, i, 1).toLocaleString("en-IN", { month: "short" }),
      billed: 250000 + i * 8000 + (i % 2 ? 12000 : -6000),
      expenses: 120000 + i * 5000 + (i % 3 ? 8000 : 0)
    }));
    return Promise.resolve(data);
  }
  if (path.startsWith("/beds")) {
    const items = Array.from({ length: 30 }).map((_, i) => ({
      id: i + 1,
      hostel: ["Mullai Nagar", "J Block", "Pioneer 1", "Kambar Colony", "Pioneer 2"][i % 5],
      room: `R-${(i % 12) + 101}`,
      bed: `B${(i % 4) + 1}`,
      is_ac: i % 2 === 0,
      base_rent: 6500 + (i % 4) * 500,
      status: i % 5 === 0 ? "maintenance" : i % 3 === 0 ? "vacant" : "occupied"
    }));
    return Promise.resolve(items);
  }
  if (path.startsWith("/tenants")) {
    const items = Array.from({ length: 20 }).map((_, i) => ({
      id: i + 1,
      name: `Tenant ${i + 1}`,
      phone: `9${Math.floor(100000000 + Math.random() * 899999999)}`,
      hostel: ["Mullai Nagar", "J Block", "Pioneer 1", "Kambar Colony", "Pioneer 2"][i % 5],
      room: `R-${(i % 12) + 101}`,
      bed: `B${(i % 4) + 1}`,
      check_in: new Date(2025, i % 10, 2).toISOString().slice(0, 10),
      rent: 7000 + (i % 4) * 500,
      status: i % 7 === 0 ? "notice" : "active"
    }));
    return Promise.resolve(items);
  }
  if (path.startsWith("/invoices")) {
    const items = Array.from({ length: 25 }).map((_, i) => ({
      id: 1000 + i,
      tenant: `Tenant ${(i % 20) + 1}`,
      month: new Date(2025, i % 12, 1).toISOString().slice(0, 7),
      due_date: new Date(2025, i % 12, 5).toISOString().slice(0, 10),
      amount_due: 7500 + (i % 4) * 500,
      paid: i % 3 === 0 ? 7500 : 0,
      status: i % 3 === 0 ? "paid" : "unpaid"
    }));
    return Promise.resolve(items);
  }
  if (path.startsWith("/expenses")) {
    const items = Array.from({ length: 20 }).map((_, i) => ({
      id: i + 1,
      date: new Date(2025, i % 12, 10).toISOString().slice(0, 10),
      hostel: ["Mullai Nagar", "J Block", "Pioneer 1", "Kambar Colony", "Pioneer 2"][i % 5],
      category: ["Utilities", "Maintenance", "Capex", "Supplies"][i % 4],
      subcategory: ["Electricity", "Plumbing", "Furniture", "Cleaning"][i % 4],
      amount: 2500 + (i % 6) * 1200,
      notes: i % 2 ? "" : "Quarterly service"
    }));
    return Promise.resolve(items);
  }
  return Promise.resolve([]);
}

function formatINR(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(n || 0);
}

// ---------- THEME ----------
function makeTheme(mode) {
  const dark =
    mode === "dark" ||
    (mode === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (dark) {
    return {
      mode: "dark",
      appBg: "linear-gradient(to bottom, #0b0f14, #0e131a)",
      surface: "rgba(255,255,255,0.04)",
      cardBg: "rgba(255,255,255,0.04)",
      cardShadow: "0 1px 0 rgba(255,255,255,0.04), 0 6px 20px rgba(0,0,0,0.35)",
      border: "rgba(255,255,255,0.08)",
      text: "#e5e7eb",
      textMuted: "#9ca3af",
      topbarBg: "rgba(14,19,26,0.75)",
      focus: "#60a5fa",
      primary: "#38bdf8", // cyan-400
      success: "#22c55e",
      warnBg: "rgba(245,158,11,0.18)", // amber-ish ring
      destructive: "#ef4444",
      inputBg: "rgba(255,255,255,0.06)",
      inputBorder: "rgba(255,255,255,0.12)",
      badgeTextDark: "#0b0f14",
      chartBar1: "#38bdf8",
      chartBar2: "#22c55e",
      grid: "rgba(255,255,255,0.08)",
      axis: "rgba(255,255,255,0.6)",
      tooltipBg: "rgba(23, 28, 36, 0.95)",
      tooltipBorder: "rgba(255,255,255,0.08)",
      tooltipText: "#e5e7eb"
    };
  }

  // Light fallback (still elegant)
  return {
    mode: "light",
    appBg: "linear-gradient(to bottom, #f9fafb, #ffffff)",
    surface: "#ffffff",
    cardBg: "white",
    cardShadow: "0 1px 2px rgba(0,0,0,0.03)",
    border: "#e5e7eb",
    text: "#111827",
    textMuted: "#6b7280",
    topbarBg: "rgba(255,255,255,0.8)",
    focus: "#0ea5e9",
    primary: "#0ea5e9",
    success: "#22c55e",
    warnBg: "#fef3c7",
    destructive: "#ef4444",
    inputBg: "white",
    inputBorder: "#e5e7eb",
    badgeTextDark: "#111827",
    chartBar1: "#0ea5e9",
    chartBar2: "#22c55e",
    grid: "#e5e7eb",
    axis: "#6b7280",
    tooltipBg: "#ffffff",
    tooltipBorder: "#e5e7eb",
    tooltipText: "#111827"
  };
}

export default function StayInnDashboardStandalone() {
  // ---------- DATA ----------
  const [metrics, setMetrics] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [beds, setBeds] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // ---------- UI STATE ----------
  const [q, setQ] = useState("");
  const [hostelFilter, setHostelFilter] = useState("all");
  const [range, setRange] = useState("last-6");
  const [showExpense, setShowExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    date: "",
    hostel: "",
    category: "",
    subcategory: "",
    amount: "",
    notes: ""
  });

  // Theme mode: "system" | "light" | "dark"
  const [mode, setMode] = useState("system");
  const [theme, setTheme] = useState(makeTheme("system"));

  // Respond to mode + system changes
  useEffect(() => {
    const apply = () => setTheme(makeTheme(mode));
    apply();
    if (mode === "system" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener?.("change", apply);
      return () => mq.removeEventListener?.("change", apply);
    }
  }, [mode]);

  useEffect(() => {
    (async () => {
      const [m, rev, b, t, inv, exp] = await Promise.all([
        apiGet("/metrics"),
        apiGet("/revenue/monthly"),
        apiGet("/beds"),
        apiGet("/tenants"),
        apiGet("/invoices"),
        apiGet("/expenses")
      ]);
      setMetrics(m);
      setRevenue(rev);
      setBeds(b);
      setTenants(t);
      setInvoices(inv);
      setExpenses(exp);
    })();
  }, []);

  const filteredBeds = useMemo(
    () =>
      beds.filter(
        (b) =>
          (hostelFilter === "all" || b.hostel === hostelFilter) &&
          JSON.stringify(b).toLowerCase().includes(q.toLowerCase())
      ),
    [beds, hostelFilter, q]
  );
  const filteredTenants = useMemo(
    () =>
      tenants.filter(
        (t) =>
          (hostelFilter === "all" || t.hostel === hostelFilter) &&
          JSON.stringify(t).toLowerCase().includes(q.toLowerCase())
      ),
    [tenants, hostelFilter, q]
  );
  const filteredInvoices = useMemo(
    () =>
      invoices.filter(
        (i) =>
          (hostelFilter === "all" || (i.hostel || "") === hostelFilter) &&
          JSON.stringify(i).toLowerCase().includes(q.toLowerCase())
      ),
    [invoices, hostelFilter, q]
  );
  const filteredExpenses = useMemo(
    () =>
      expenses.filter(
        (e) =>
          (hostelFilter === "all" || e.hostel === hostelFilter) &&
          JSON.stringify(e).toLowerCase().includes(q.toLowerCase())
      ),
    [expenses, hostelFilter, q]
  );

  const hostels = useMemo(
    () => ["all", ...Array.from(new Set(beds.map((b) => b.hostel)))],
    [beds]
  );
  const lastMonths = useMemo(() => {
    if (!revenue?.length) return [];
    const n = range === "last-6" ? 6 : 12;
    return revenue.slice(-n);
  }, [revenue, range]);

  // ---------- SUB-COMPONENTS (access theme) ----------
  const Card = ({ children }) => (
    <div
      style={{
        border: `1px solid ${theme.border}`,
        borderRadius: 16,
        background: theme.cardBg,
        boxShadow: theme.cardShadow
      }}
    >
      {children}
    </div>
  );

  const CardBody = ({ children, style }) => (
    <div style={{ padding: 16, ...style }}>{children}</div>
  );

  const Badge = ({ children, variant }) => {
    const styles = {
      default: { bg: theme.success, color: "white" },
      secondary: {
        bg:
          theme.mode === "dark"
            ? "rgba(255,255,255,0.10)"
            : "rgba(17,24,39,0.06)",
        color: theme.text
      },
      destructive: { bg: theme.destructive, color: "white" }
    };
    const { bg, color } = styles[variant || "default"];
    return (
      <span
        style={{
          background: bg,
          color,
          padding: "2px 8px",
          borderRadius: 999,
          fontSize: 12
        }}
      >
        {children}
      </span>
    );
  };

  const SimpleTable = ({ columns, data }) => (
    <div
      style={{
        overflowX: "auto",
        border: `1px solid ${theme.border}`,
        borderRadius: 16,
        background: theme.cardBg
      }}
    >
      <table style={{ width: "100%", fontSize: 14 }} className={sfProClass}>
        <thead
          style={{
            background:
              theme.mode === "dark"
                ? "rgba(255,255,255,0.04)"
                : "rgba(249,250,251,1)",
            color: theme.textMuted
          }}
        >
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  fontWeight: 600
                }}
              >
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              style={{
                borderTop: `1px solid ${theme.border}`,
                color: theme.text
              }}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  style={{ padding: "10px 12px", whiteSpace: "nowrap" }}
                >
                  {c.render ? c.render(row[c.key], row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const Field = ({ label, children }) => (
    <label style={{ display: "grid", gap: 6, fontSize: 12 }}>
      <span style={{ color: theme.textMuted }}>{label}</span>
      <div
        style={{
          display: "grid"
        }}
      >
        {children}
      </div>
    </label>
  );

  const Tabs = ({ tabs }) => {
    const [active, setActive] = useState(tabs[0]?.id);
    return (
      <div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {tabs.map((t) => {
            const selected = active === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                style={{
                  padding: "8px 12px",
                  border: `1px solid ${theme.border}`,
                  borderRadius: 12,
                  background: selected ? theme.text : theme.cardBg,
                  color: selected ? theme.badgeTextDark : theme.text
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 12 }}>
          {tabs.find((t) => t.id === active)?.content}
        </div>
      </div>
    );
  };

  const MetricCard = ({ icon, label, value, right, tone }) => {
    return (
      <Card>
        <CardBody>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                padding: 8,
                borderRadius: 12,
                background:
                  theme.mode === "dark"
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(243,244,246,1)",
                color: theme.text
              }}
            >
              {icon}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: 0.4,
                  textTransform: "uppercase",
                  color: theme.textMuted
                }}
              >
                {label}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontWeight: 700,
                  fontSize: 18,
                  color:
                    tone === "warn"
                      ? theme.mode === "dark"
                        ? "#fde68a"
                        : "#92400e"
                      : theme.text
                }}
              >
                {value}
                {right}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  const inputStyle = {
    padding: "8px 10px",
    border: `1px solid ${theme.inputBorder}`,
    background: theme.inputBg,
    color: theme.text,
    borderRadius: 10,
    outline: "none"
  };

  const inputFocusStyle = { boxShadow: `0 0 0 3px ${theme.focus}33` };

  // ---------- RENDER ----------
  return (
    <div
      className={sfProClass}
      style={{
        minHeight: "100vh",
        width: "100vw",       // force full viewport width
        margin: 0,            // remove any outer gap
        boxSizing: "border-box",
        background: theme.appBg,
        color: theme.text
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backdropFilter: "saturate(180%) blur(12px)",
          background: theme.topbarBg,
          borderBottom: `1px solid ${theme.border}`
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "100%",
            margin: 0,
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            gap: 12
          }}
        >
          <Building2 size={22} />
          <div style={{ fontWeight: 600 }}>Stay Inn — Ops Dashboard</div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: 10,
                  top: 10,
                  color: theme.textMuted
                }}
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search beds, tenants, invoices…"
                style={{
                  ...inputStyle,
                  paddingLeft: 30,
                  width: 260
                }}
                onFocus={(e) =>
                  Object.assign(e.target.style, inputFocusStyle)
                }
                onBlur={(e) => (e.target.style.boxShadow = "none")}
              />
            </div>

            <select
              value={hostelFilter}
              onChange={(e) => setHostelFilter(e.target.value)}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            >
              {hostels.map((h) => (
                <option
                  key={h}
                  value={h}
                  style={{
                    background: theme.cardBg,
                    color: theme.text
                  }}
                >
                  {h === "all" ? "All hostels" : h}
                </option>
              ))}
            </select>

            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            >
              <option value="last-6">Last 6 months</option>
              <option value="last-12">Last 12 months</option>
            </select>

            <button
              onClick={() => setShowExpense(true)}
              style={{
                padding: "8px 12px",
                border: `1px solid ${theme.primary}`,
                background: theme.primary,
                color: "white",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <Plus size={16} /> Add Expense
            </button>

            {/* Theme toggle */}
            <div
              style={{
                display: "flex",
                gap: 6,
                paddingLeft: 8,
                borderLeft: `1px solid ${theme.border}`
              }}
            >
              <IconToggle
                title="System"
                active={mode === "system"}
                onClick={() => setMode("system")}
              >
                <Laptop size={16} />
              </IconToggle>
              <IconToggle
                title="Light"
                active={mode === "light"}
                onClick={() => setMode("light")}
              >
                <Sun size={16} />
              </IconToggle>
              <IconToggle
                title="Dark"
                active={mode === "dark"}
                onClick={() => setMode("dark")}
              >
                <MoonStar size={16} />
              </IconToggle>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          margin: 0,
          padding: "24px 24px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 16
        }}
      >
        <MetricCard icon={<Users size={18} />} label="Tenants" value={metrics?.tenants} />
        <MetricCard
          icon={<BedDouble size={18} />}
          label="Occupancy"
          value={`${Math.round((metrics?.occupancy || 0) * 100)}%`}
          right={<TrendingUp size={14} />}
        />
        <MetricCard
          icon={<Receipt size={18} />}
          label="Billed (this month)"
          value={formatINR(metrics?.monthlyBilled)}
        />
        <MetricCard
          icon={<IndianRupee size={18} />}
          label="Dues"
          value={formatINR(metrics?.dues)}
          tone="warn"
        />
      </div>

      {/* Charts */}
      <div style={{ width: "100%", maxWidth: "100%", margin: 0, padding: "0 24px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card>
            <CardBody>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                  color: theme.text
                }}
              >
                <CalendarDays size={16} />
                <div style={{ fontWeight: 600 }}>Revenue vs Expenses</div>
              </div>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lastMonths}>
                    <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      stroke={theme.axis}
                      tick={{ fill: theme.axis }}
                    />
                    <YAxis stroke={theme.axis} tick={{ fill: theme.axis }} />
                    <Tooltip
                      contentStyle={{
                        background: theme.tooltipBg,
                        border: `1px solid ${theme.tooltipBorder}`,
                        borderRadius: 8,
                        color: theme.tooltipText
                      }}
                      labelStyle={{ color: theme.tooltipText }}
                      itemStyle={{ color: theme.tooltipText }}
                    />
                    <Bar dataKey="billed" fill={theme.chartBar1} name="Billed" />
                    <Bar dataKey="expenses" fill={theme.chartBar2} name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div style={{ fontWeight: 600, marginBottom: 8, color: theme.text }}>
                Collections Trend
              </div>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lastMonths}>
                    <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      stroke={theme.axis}
                      tick={{ fill: theme.axis }}
                    />
                    <YAxis stroke={theme.axis} tick={{ fill: theme.axis }} />
                    <Tooltip
                      contentStyle={{
                        background: theme.tooltipBg,
                        border: `1px solid ${theme.tooltipBorder}`,
                        borderRadius: 8,
                        color: theme.tooltipText
                      }}
                      labelStyle={{ color: theme.tooltipText }}
                      itemStyle={{ color: theme.tooltipText }}
                    />
                    <Line
                      type="monotone"
                      dataKey="billed"
                      stroke={theme.chartBar1}
                      name="Billed"
                      dot={false}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke={theme.chartBar2}
                      name="Expenses"
                      dot={false}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Tabs (simple) */}
      <div style={{ width: "100%", maxWidth: "100%", margin: 0, padding: "0 24px 48px" }}>
        <Tabs
          tabs={[
            {
              id: "beds",
              label: "Beds",
              content: (
                <SimpleTable
                  columns={[
                    { key: "hostel", title: "Hostel" },
                    { key: "room", title: "Room" },
                    { key: "bed", title: "Bed" },
                    {
                      key: "is_ac",
                      title: "AC?",
                      render: (v) => (v ? <Badge>AC</Badge> : <Badge variant="secondary">Non-AC</Badge>)
                    },
                    { key: "base_rent", title: "Base Rent", render: (v) => formatINR(v) },
                    {
                      key: "status",
                      title: "Status",
                      render: (v) =>
                        v === "occupied" ? (
                          <Badge>Occupied</Badge>
                        ) : v === "vacant" ? (
                          <Badge variant="secondary">Vacant</Badge>
                        ) : (
                          <Badge variant="secondary">Maintenance</Badge>
                        )
                    }
                  ]}
                  data={filteredBeds}
                />
              )
            },
            {
              id: "tenants",
              label: "Tenants",
              content: (
                <SimpleTable
                  columns={[
                    { key: "name", title: "Tenant" },
                    { key: "phone", title: "Phone" },
                    { key: "hostel", title: "Hostel" },
                    { key: "room", title: "Room" },
                    { key: "bed", title: "Bed" },
                    { key: "check_in", title: "Check-in" },
                    { key: "rent", title: "Agreed Rent", render: (v) => formatINR(v) },
                    {
                      key: "status",
                      title: "Status",
                      render: (v) =>
                        v === "active" ? (
                          <Badge>Active</Badge>
                        ) : (
                          <Badge variant="secondary">Notice</Badge>
                        )
                    }
                  ]}
                  data={filteredTenants}
                />
              )
            },
            {
              id: "invoices",
              label: "Invoices",
              content: (
                <SimpleTable
                  columns={[
                    { key: "tenant", title: "Tenant" },
                    { key: "month", title: "Month" },
                    { key: "due_date", title: "Due Date" },
                    { key: "amount_due", title: "Amount", render: (v) => formatINR(v) },
                    {
                      key: "status",
                      title: "Status",
                      render: (v) =>
                        v === "paid" ? (
                          <Badge>Paid</Badge>
                        ) : (
                          <Badge variant="destructive">Unpaid</Badge>
                        )
                    }
                  ]}
                  data={filteredInvoices}
                />
              )
            },
            {
              id: "expenses",
              label: "Expenses",
              content: (
                <SimpleTable
                  columns={[
                    { key: "date", title: "Date" },
                    { key: "hostel", title: "Hostel" },
                    { key: "category", title: "Category" },
                    { key: "subcategory", title: "Subcategory" },
                    { key: "amount", title: "Amount", render: (v) => formatINR(v) },
                    { key: "notes", title: "Notes" }
                  ]}
                  data={filteredExpenses}
                />
              )
            }
          ]}
        />
      </div>

      {/* Modal */}
      {showExpense && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "grid",
            placeItems: "center"
          }}
          onClick={() => setShowExpense(false)}
        >
          <div
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: 16,
              width: 520,
              maxWidth: "90%",
              padding: 16,
              boxShadow:
                theme.mode === "dark"
                  ? "0 20px 60px rgba(0,0,0,0.5)"
                  : "0 20px 60px rgba(0,0,0,0.12)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontWeight: 700, marginBottom: 12, color: theme.text }}>
              Add Expense
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Date">
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                />
              </Field>
              <Field label="Hostel">
                <input
                  placeholder="HS-KRM"
                  value={newExpense.hostel}
                  onChange={(e) => setNewExpense({ ...newExpense, hostel: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                />
              </Field>
              <Field label="Category">
                <input
                  placeholder="Utilities"
                  value={newExpense.category}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, category: e.target.value })
                  }
                  style={inputStyle}
                  onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                />
              </Field>
              <Field label="Subcategory">
                <input
                  placeholder="Electricity"
                  value={newExpense.subcategory}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, subcategory: e.target.value })
                  }
                  style={inputStyle}
                  onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                />
              </Field>
              <Field label="Amount">
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, amount: e.target.value })
                  }
                  style={inputStyle}
                  onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                />
              </Field>
              <div style={{ gridColumn: "1 / -1" }}>
                <Field label="Notes">
                  <input
                    value={newExpense.notes}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, notes: e.target.value })
                    }
                    style={inputStyle}
                    onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                    onBlur={(e) => (e.target.style.boxShadow = "none")}
                  />
                </Field>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <button
                onClick={() => setShowExpense(false)}
                style={{
                  padding: "8px 12px",
                  border: `1px solid ${theme.border}`,
                  background: theme.cardBg,
                  color: theme.text,
                  borderRadius: 10
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setExpenses([
                    {
                      id: Date.now(),
                      date: newExpense.date,
                      hostel: newExpense.hostel,
                      category: newExpense.category,
                      subcategory: newExpense.subcategory,
                      amount: Number(newExpense.amount),
                      notes: newExpense.notes
                    },
                    ...expenses
                  ]);
                  setShowExpense(false);
                  setNewExpense({
                    date: "",
                    hostel: "",
                    category: "",
                    subcategory: "",
                    amount: "",
                    notes: ""
                  });
                }}
                style={{
                  padding: "8px 12px",
                  border: `1px solid ${theme.primary}`,
                  background: theme.primary,
                  color: "white",
                  borderRadius: 10
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Small helper for theme toggle buttons
function IconToggle({ children, active, onClick, title }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        padding: 8,
        borderRadius: 10,
        border: `1px solid rgba(255,255,255,0.12)`,
        background: active ? "rgba(255,255,255,0.12)" : "transparent",
        color: "inherit",
        display: "grid",
        placeItems: "center"
      }}
    >
      {children}
    </button>
  );
}
