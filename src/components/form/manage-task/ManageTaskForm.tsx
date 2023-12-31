// Importing necessary dependencies and components
import { FC } from "react";
import Box from "@mui/material/Box";
import { FormHelperText, Button, Grid, InputLabel } from "@mui/material";
import RhfCKEditorComponent from "../../ck-editor/CkEditorComponent";
import SubmitButtonComponent from "../../common/buttons/SubmitButtonComponent";
import { ManageTaskFormProps, useManageTask } from "./Helper";
import RhfMultiUsersAutocomplete from "../../common/textfield/autocomplete/multi-autocomplete/RhfMultiUsersAutocomplete";
import RhfTextfieldComponent from "../../common/textfield/RhfTextFieldComponent";
import RhfLabelAutocomplete from "../../common/textfield/autocomplete/label-autocomplete/RhfLabelAutocomplete";

// Functional component for managing task form
const ManageTaskForm: FC<ManageTaskFormProps> = ({
  values,
  activeStatus,
  setTasks,
  setRefresh,
}) => {
  // Destructuring values and functions from the custom hook
  const {
    control,
    setValue,
    handleDialogClose,
    isSubmitting,
    assigneesApiDetails,
    handleSubmit,
    onSubmit,
  } = useManageTask({ values, activeStatus, setTasks, setRefresh });

  // Rendering the task form
  return (
    <Box
      component="form"
      display="flex"
      p={2}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} gap={2}>
          {/* Form helper text for label */}
          <FormHelperText sx={{ fontSize: 15 }}>Label *</FormHelperText>
          {/* Label autocomplete component */}
          <RhfLabelAutocomplete
            control={control}
            name="labelId"
            size="small"
            required
            defaultValue={values?.label}
            label=""
          />
          {/* Form helper text for task */}
          <FormHelperText sx={{ fontSize: 15 }}>Task *</FormHelperText>
          {/* Textfield component for entering task */}
          <RhfTextfieldComponent control={control} name="task" />
          {/* CKEditor component for entering task description */}
          <RhfCKEditorComponent
            control={control}
            label="Description"
            name="description"
            height="150px"
          />
          {/* Input label for assignees */}
          <InputLabel id="assignees-autocomplete">Assignees</InputLabel>
          {/* Multi-users autocomplete component */}
          <RhfMultiUsersAutocomplete
            useFormHooks={{ control: control, setValue: setValue }}
            label=""
            name="assignees"
            size="small"
            defaultValues={values?.assignees}
            apiDetails={assigneesApiDetails}
          />
        </Grid>
        <Grid item md={10} xs={12}>
          {/* Box for displaying buttons with close and submit actions */}
          <Box display="flex" justifyContent="end" columnGap={1}>
            {/* Button for closing the dialog */}
            <Button
              variant="outlined"
              color="error"
              onClick={handleDialogClose}
            >
              Close
            </Button>
            {/* Submit button component */}
            <SubmitButtonComponent
              title={values ? "Update Task" : "Create Task"}
              loading={isSubmitting}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

// Exporting the component as the default export
export default ManageTaskForm;
