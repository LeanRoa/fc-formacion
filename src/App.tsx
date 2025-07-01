// src/App.tsx
import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import "./App.css";

const firebaseConfig = {
  apiKey: "AIzaSyADI_zGBCHAfTUhQJiLOzHe-XKVwTO7Wbw",
  authDomain: "fc-clubes-formacion.firebaseapp.com",
  projectId: "fc-clubes-formacion",
  storageBucket: "fc-clubes-formacion.firebasestorage.app",
  messagingSenderId: "744307118621",
  appId: "1:744307118621:web:5ae0afbf880e1e3bfbecf4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const formations: Record<
  string,
  { id: string; label: string; top: string; left: string }[]
> = {
  "3-4-1-2": [
    { id: "POR", label: "POR", top: "90%", left: "50%" },
    { id: "DFC1", label: "DFC", top: "75%", left: "25%" },
    { id: "DFC2", label: "DFC", top: "72%", left: "50%" },
    { id: "DFC3", label: "DFC", top: "75%", left: "75%" },
    { id: "MC1", label: "MC", top: "58%", left: "35%" },
    { id: "MC2", label: "MC", top: "58%", left: "65%" },
    { id: "MI", label: "MI", top: "48%", left: "18%" },
    { id: "MD", label: "MD", top: "48%", left: "82%" },
    { id: "MCO", label: "MCO", top: "42%", left: "50%" },
    { id: "DC1", label: "DC", top: "26%", left: "38%" },
    { id: "DC2", label: "DC", top: "26%", left: "62%" },
  ],
  "4-1-2-1-2": [
    { id: "POR", label: "POR", top: "90%", left: "50%" },
    { id: "LI", label: "LI", top: "75%", left: "15%" },
    { id: "DFC1", label: "DFC", top: "75%", left: "62%" },
    { id: "DFC2", label: "DFC", top: "75%", left: "38%" },
    { id: "LD", label: "LD", top: "75%", left: "85%" },

    { id: "MI", label: "MI", top: "48%", left: "18%" },
    { id: "MD", label: "MD", top: "48%", left: "82%" },
    { id: "MC", label: "MCD", top: "60%", left: "50%" },

    { id: "MCO", label: "MCO", top: "42%", left: "50%" },
    { id: "DC1", label: "DC", top: "26%", left: "38%" },
    { id: "DC2", label: "DC", top: "26%", left: "62%" },
  ],
};

function App() {
  const [selectedFormation, setSelectedFormation] = useState("3-4-1-2");
  const [names, setNames] = useState<Record<string, string[]>>({});
  const [inputs, setInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    console.log("useEffect ejecutado para:", selectedFormation);

    const fetchData = async () => {
      const snapshot = await getDocs(
        collection(db, `formations/${selectedFormation}/positions`)
      );

      console.log(
        "Docs:",
        snapshot.docs.map((d) => d.id)
      );
      const data: Record<string, string[]> = {};
      snapshot.forEach((doc) => {
        const docData = doc.data();
        console.log("Firestore data:", doc.id, docData); // <-- Agregá esto

        if (Array.isArray(docData.names)) {
          data[doc.id] = docData.names;
        }
      });
      setNames(data);
    };
    fetchData();
  }, [selectedFormation]);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".player-box")) {
        setExpandedBox(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
  const handleChange = (posId: string, value: string) => {
    setInputs((prev) => ({ ...prev, [posId]: value }));
  };

  const handleSubmit = async (posId: string) => {
    const name = inputs[posId]?.trim();
    if (!name) return;

    const ref = doc(db, `formations/${selectedFormation}/positions`, posId);
    const existing = await getDoc(ref);

    if (!existing.exists()) {
      await setDoc(ref, { names: [name] });
      setNames((prev) => ({ ...prev, [posId]: [name] }));
    } else {
      const currentNames: string[] = existing.data().names || [];
      if (currentNames.includes(name)) {
        alert("Ya agregaste tu nombre en esta posición.");
        return;
      }
      const updatedNames = [...currentNames, name];
      await updateDoc(ref, { names: updatedNames });
      setNames((prev) => ({ ...prev, [posId]: updatedNames }));
    }
    setInputs((prev) => ({ ...prev, [posId]: "" }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const [view, setView] = useState<"formacion" | "about">("about");
  const [expandedBox, setExpandedBox] = useState<string | null>(null);

  return (
    <>
      <header className="main-header">
        <div className="header-content">
          <div
            className="logo"
            onClick={() => setView("about")}
            style={{ cursor: "pointer" }}
          >
            Mavale FC
          </div>{" "}
          <nav className="nav-menu">
            <div className="dropdown">
              <button className="dropbtn">Menú ▾</button>
              <div className="dropdown-content">
                <div className="sub-dropdown">
                  <button className="sub-dropbtn">Formación ▸</button>
                  <div className="sub-dropdown-content">
                    <button
                      onClick={() => {
                        setSelectedFormation("3-4-1-2");
                        setView("formacion");
                      }}
                    >
                      3-4-1-2
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFormation("4-1-2-1-2");
                        setView("formacion");
                      }}
                    >
                      4-1-2-1-2
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {view === "formacion" && (
        <div className="app-wrapper">
          <div>
            <div className="formation-selector">
              Seleccionar formación:&nbsp;
              <select
                id="f-selected"
                value={selectedFormation}
                onChange={(e) => setSelectedFormation(e.target.value)}
              >
                {Object.keys(formations).map((formation) => (
                  <option key={formation} value={formation}>
                    {formation}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-background">
              {formations[selectedFormation].map(({ id, label, top, left }) => (
                <div
                  key={id}
                  className={`player-box ${
                    expandedBox === id ? "expanded" : ""
                  }`}
                  style={{ top, left, position: "absolute" }}
                  onClick={() => setExpandedBox(expandedBox === id ? null : id)}
                >
                  <div className="label">{label}</div>
                  <ul>
                    {(names[id] || []).map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                  <input
                    placeholder="Tu nombre"
                    value={inputs[id] || ""}
                    onChange={(e) => handleChange(id, e.target.value)}
                  />
                  <button onClick={() => handleSubmit(id)}>Agregar</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === "about" && (
        <div className="about-wrapper">
          <div className="about-column">
            <p>
              Mavale FC es un equipo formado por amigos, que compite en FC
              Clubes Pro.
            </p>
            <p>
              Esta app permite organizar nuestras formaciones, establecer
              titulares y suplentes, y coordinar quiénes juegan en cada partido.
            </p>
            <p>
              Cada jugador puede agregar su nombre a la posición que le
              corresponde, y así todos sabemos quiénes están disponibles para
              jugar.
            </p>
            <p>
              Ir a la sección de "Formación" dentro del menú para ver el campo y
              agregar tu nombre en la posición que te corresponde.
            </p>
            <img
              src="/IMG_3836.jpeg"
              alt="Team Mavale FC"
              className="about-image"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
