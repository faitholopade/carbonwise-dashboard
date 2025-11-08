import { NavLink } from "@/components/NavLink";
import { Upload, BarChart3, Globe, FileText, BookOpen } from "lucide-react";

const navItems = [
  { to: "/", label: "Upload", icon: Upload },
  { to: "/compare", label: "Compare", icon: BarChart3 },
  { to: "/region-advisor", label: "Region Advisor", icon: Globe },
  { to: "/report", label: "Report", icon: FileText },
  { to: "/expectations", label: "Expectations", icon: BookOpen },
];

export function Navigation() {
  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">CarbonWise</h1>
          </div>
          
          <div className="flex gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                activeClassName="text-primary bg-secondary"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
