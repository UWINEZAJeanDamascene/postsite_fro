import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Contact,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { clientApi } from "@/api/mainManager";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Client, CreateClientDto } from "@/types";

const ITEMS_PER_PAGE = 10;

interface ClientFormProps {
  client?: Client;
  onSubmit: (data: CreateClientDto) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

function ClientForm({
  client,
  onSubmit,
  onCancel,
  isSubmitting,
}: ClientFormProps) {
  const [formData, setFormData] = useState<CreateClientDto>({
    name: client?.name || "",
    contactPerson: client?.contactPerson || "",
    email: client?.email || "",
    phone: client?.phone || "",
    address: client?.address || "",
    taxId: client?.taxId || "",
    notes: client?.notes || "",
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Client name is required");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Client Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(event) =>
            setFormData({ ...formData, name: event.target.value })
          }
          className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
          placeholder="Enter client name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Contact Person
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={formData.contactPerson}
            onChange={(event) =>
              setFormData({ ...formData, contactPerson: event.target.value })
            }
            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
            placeholder="Enter contact person"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              value={formData.email}
              onChange={(event) =>
                setFormData({ ...formData, email: event.target.value })
              }
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
              placeholder="client@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Phone
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(event) =>
                setFormData({ ...formData, phone: event.target.value })
              }
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
              placeholder="+1 234 567 890"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Tax ID
        </label>
        <input
          type="text"
          value={formData.taxId}
          onChange={(event) =>
            setFormData({ ...formData, taxId: event.target.value })
          }
          className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
          placeholder="Enter client tax identifier"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Address
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <textarea
            value={formData.address}
            onChange={(event) =>
              setFormData({ ...formData, address: event.target.value })
            }
            rows={3}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground resize-none"
            placeholder="Enter client address"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(event) =>
            setFormData({ ...formData, notes: event.target.value })
          }
          rows={3}
          className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground resize-none"
          placeholder="Internal notes"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-input text-foreground rounded-lg hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg",
            "hover:bg-primary/90 transition-colors",
            "flex items-center justify-center gap-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {client ? "Update Client" : "Create Client"}
        </button>
      </div>
    </form>
  );
}

export function Clients() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["clients"],
    queryFn: clientApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: clientApi.create,
    onSuccess: () => {
      toast.success("Client created successfully");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setShowForm(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create client");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateClientDto> }) =>
      clientApi.update(id, data),
    onSuccess: () => {
      toast.success("Client updated successfully");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setEditingClient(null);
      setShowForm(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update client");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: clientApi.delete,
    onSuccess: () => {
      toast.success("Client deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete client");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      clientApi.toggleActive(id, isActive),
    onSuccess: (client) => {
      toast.success(`Client ${client.isActive ? "activated" : "deactivated"}`);
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update client status",
      );
    },
  });

  const filteredClients =
    data?.filter(
      (client) =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.contactPerson
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.taxId?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE) || 1;
  const paginatedClients = filteredClients.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleSubmit = (formData: CreateClientDto) => {
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, data: formData });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  if (showForm) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {editingClient ? "Edit Client" : "Create Client"}
            </h1>
            <p className="text-muted-foreground">
              {editingClient
                ? "Update client information"
                : "Add a new client to your system"}
            </p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <ClientForm
            client={editingClient || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-1">
            Manage customer and client contact information
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search by name, contact, email, or tax ID..."
            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
          />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tax ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-foreground">
                      Failed to load clients
                    </h3>
                  </td>
                </tr>
              ) : paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Contact className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-foreground">
                      No clients found
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      {searchQuery
                        ? "Try adjusting your search"
                        : "Create your first client"}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedClients.map((client) => (
                  <tr key={client.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Contact className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <button
                            onClick={() => navigate(`/clients/${client.id}`)}
                            className="font-medium text-foreground hover:text-primary hover:underline text-left"
                          >
                            {client.name}
                          </button>
                          <div className="text-sm text-muted-foreground">
                            {client.email || "No email"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {client.contactPerson || "-"}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {client.phone || "-"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {client.taxId || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          toggleActiveMutation.mutate({
                            id: client.id,
                            isActive: !client.isActive,
                          })
                        }
                        disabled={toggleActiveMutation.isPending}
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                          client.isActive
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400",
                        )}
                      >
                        {client.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/clients/${client.id}`)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleEdit(client)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          title="Edit client"
                        >
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          title="Delete client"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredClients.length > 0 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(page * ITEMS_PER_PAGE, filteredClients.length)} of{" "}
              {filteredClients.length} clients
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
