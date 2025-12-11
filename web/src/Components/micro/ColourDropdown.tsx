import { FC, useEffect, useRef, useState } from "react";
import { Box, Menu, Button } from "@mantine/core";
import type { TColours, TEyeColour, THairColour, THeadOverlay } from "../../types/appearance";



type ColourMap = {
  hair: THairColour;
  eye: TEyeColour;
  makeup: THeadOverlay[keyof THeadOverlay];
};

/*
    Props mirror the Svelte exports
*/
interface ColourDropdownProps {
  index: number;
  colourType: keyof ColourMap;
  value: ColourMap[keyof ColourMap] | null;
  onChange: (value: ColourMap[keyof ColourMap]) => void;
}

const ShrinkText = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let size = 16; // starting font size
    el.style.fontSize = size + "px";

    // Reduce until fits
    while (el.scrollWidth > el.clientWidth && size > 8) {
      size -= 1;
      el.style.fontSize = size + "px";
    }
  }, [children]);

  return (
    <span
      ref={ref}
      style={{
        display: "inline-block",
        whiteSpace: "nowrap",
        overflow: "hidden",
        minWidth: 0,
        maxWidth: "100%",
      }}
    >
      {children}
    </span>
  );
};


export const ColourDropdown: FC<ColourDropdownProps> = (props) => {
  const { index, value, colourType, onChange } = props;
  const [colours, setColours] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(index);
  const [display, setDisplay] = useState(
    value && typeof value === 'object' && 'label' in value && typeof value.label === 'string' ? value.label : ""
  );
  const hasMountedRef = useRef(false);

  // Load colours on mount or when the colourType changes
  useEffect(() => {
    const colourMap = {
      hair: "HAIR_COLOURS",
      eye: "EYE_COLOURS",
      makeup: "MAKEUP_COLOURS",
    } as const;

    const loadColours = async () => {
      const module = await import("./colours");
      const arr = module[colourMap[colourType]] as any[];

      setColours(arr);

      // Use the current index prop, not selectedIndex state
      const fixedIndex = index === -1 ? 0 : index;
      const newValue = arr[fixedIndex] ?? arr[0];

      setSelectedIndex(fixedIndex);
      setDisplay(newValue && typeof newValue === 'object' && 'label' in newValue && typeof newValue.label === 'string' ? newValue.label : "");
      
      // Mark as mounted after first load; don't call onChange on mount
      hasMountedRef.current = true;
    };

    loadColours();
  }, [colourType, index]);


  // When user clicks a colour
  const handleClick = (i: number) => {
    const selectedColour = { ...colours[i], index: i };
    setSelectedIndex(i);
    setDisplay(selectedColour.label);
    onChange(selectedColour);
  };

  return (
    <Box style={{
      width: "100%", 
      animation: 'slideDown 0.2s ease-out',
      transformOrigin: 'top',
    }}>
      <Menu shadow="md" width={280} withinPortal={false}>
        <Menu.Target>
          <Button
            fullWidth
            variant="default"
            sx={{
              background: "rgba(0,0,0,0.6)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8,
              fontWeight: 700,
              padding: "0.5rem 0.75rem",
              textAlign: "center",
              marginBottom: "0.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              minWidth: 0,
              maxWidth: "100%",
            }}
          >
            {/* Color square */}
            {colours[selectedIndex] && colours[selectedIndex].hex && (
              <Box
                sx={{
                  width: "1.25em",
                  height: "1.25em",
                  backgroundColor: colours[selectedIndex].hex,
                  borderRadius: 4,
                  border: "0px solid rgba(255,255,255,0.3)",
                  marginRight: "0.5em",
                  display: "inline-block",
                }}
              />
            )}
            <ShrinkText>
              <span style={{ lineHeight: 1.5, display: "inline-block", verticalAlign: "middle" }}>
              {display || "Select Colour"}
              </span>
            </ShrinkText>
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: "0.5vh",
              width: "100%",
              padding: "0.5rem 0rem",
              maxHeight: "20rem",
              overflowY: "auto",
            }}
          >
            {colours.map(({ hex }, i) => (
              <Box
                key={i}
                component="button"
                onClick={() => {
                  const selectedColour = { ...colours[i], index: i };
                  setSelectedIndex(i);
                  setDisplay(selectedColour.label);
                  onChange(selectedColour);
                }}
                sx={{
                  aspectRatio: "1",
                  transition: "all 150ms",
                  padding: i === selectedIndex ? 0 : "0.5vh",
                  border: i === selectedIndex ? "0.5vh solid white" : "none",
                  background: "none",
                  outline: "none",
                  cursor: "pointer",
                  borderRadius: 4,
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: hex,
                    borderRadius: 4,
                  }}
                />
              </Box>
            ))}
          </Box>
        </Menu.Dropdown>
      </Menu>
    </Box>
  );
};