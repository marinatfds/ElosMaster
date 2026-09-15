import { Modal, Box, Typography, Button, TextField } from "@mui/material";
import api from "../config/endpoint";
import * as ROUTER from "../config/endpointRoutes";
import React from "react";
import { NavigationButton } from "./navigationButton";

export default function PopupAlerts({ onClose, onSubmit, open } : any) {
  const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  const onCreateAlert = React.useCallback(function(event) {
    event.preventDefault();
    const content = event.target.elements.alertContent.value;
    const item = {
          date: new Date(),
          content
      };
    postAlert(item);
  }, []);

  const postAlert = (item: any) => {
    api.post(ROUTER.CREATE_ALERT, {
        Alert: item.content,
        DateTime: item.date.toISOString()
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Novo Alerta
          <Button className="popupCloseButton" onClick={onClose}>
            x
          </Button>
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          <div>
          <TextField
          id="filled-multiline-flexible"
          label="Crie seu alerta"
          multiline
          maxRows={4}
          variant="filled"
        />
          </div>
          <button type="submit" onSubmit={onCreateAlert}>Criar</button>
        </Typography>
      </Box>
    </Modal>
    
  );
}
