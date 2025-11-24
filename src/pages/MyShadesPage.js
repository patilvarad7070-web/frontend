import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Palette, Trash2, RefreshCw, Camera, Wand2, Droplet } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import {
  AlertDialog,  
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

// ⭐ FIXED BACKEND URL
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MyShadesPage = () => {
  const navigate = useNavigate();
  const [shades, setShades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shadeToDelete, setShadeToDelete] = useState(null);
  const token = localStorage.getItem("aura_token");

  useEffect(() => {
    fetchShades();
  }, []);

  const fetchShades = async () => {
    try {
      const res = await axios.get(`${API}/shades`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ⭐ FIXED — ALWAYS ARRAY
      setShades(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Failed to load shades");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/shades/${shadeToDelete.id}`);
      toast.success("Shade deleted");
      fetchShades();
    } catch (err) {
      toast.error("Delete failed");
    }
    setDeleteDialogOpen(false);
  };

  const handleQuickDispense = (shade) => {
    localStorage.setItem("quick_dispense_shade", JSON.stringify(shade));
    navigate("/device");
  };

  return (
    <div className="fade-in">
      <div className="glass-card p-6 rounded-3xl">
        <div className="flex justify-between mb-6">
          <h2 className="text-3xl font-bold">My Shades</h2>

          <Button onClick={fetchShades}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {loading ? (
          <p>Loading…</p>
        ) : shades.length === 0 ? (
          <p>No shades yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shades.map((shade) => (
              <div key={shade.id} className="rounded-xl bg-white/60 p-4 space-y-4">
                <div
                  className="h-24 rounded-lg"
                  style={{ background: shade.hex_color }}
                />

                <h3 className="font-bold">{shade.name}</h3>

                <Button
                  className="w-full bg-pink-400 text-white"
                  onClick={() => handleQuickDispense(shade)}
                >
                  <Droplet /> Dispense
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => {
                    setShadeToDelete(shade);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shade?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyShadesPage;