import { useEffect } from "react";
import { object, string, InferType } from "yup";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDialog } from "../../common/dialog/Helper";
import projectServices from "../../../services/project-services/ProjectServices";
import { ApiError } from "../../../services/Helper";
import generalFunctions from "../../../utils/helpers/functions/GeneralFunctions";
import { enqueueSnackbar } from "notistack";
import { UpdateProjectRequest } from "../../../services/project-services/Helper";

export interface ManageProjectFormProps {
  updateProjects: () => Promise<void>;
}
// Define the validation schema for the sign-in form
export const manageProjectFormSchema = object({
  projectName: string().min(2).max(52).required(),
  description: string().min(2).max(1002).required(),
}).required();

// Define the type for the form inputs based on the schema
export type ManageProjectFormInput = InferType<typeof manageProjectFormSchema>;

// Custom hook for handling sign-up logic
export const useManageProject = (values?: UpdateProjectRequest) => {
  const { handleDialogClose } = useDialog();
  // Initialize the React Hook Form with validation resolver and default values
  const {
    handleSubmit,
    control,
    setError,
    setValue,
    reset,
    formState: { touchedFields, isSubmitting },
  } = useForm<ManageProjectFormInput>({
    resolver: yupResolver(manageProjectFormSchema),
    defaultValues: {
      description: "",
      projectName: "",
    },
  });
  // Handle form submission
  const onSubmit: SubmitHandler<ManageProjectFormInput> = async (
    newProject: ManageProjectFormInput,
  ) => {
    if (values) {
      const updatedProject: UpdateProjectRequest = {
        ...newProject,
        projectId: values.projectId,
      };
      touchedFields?.projectName === undefined &&
        delete updatedProject.projectName;
      touchedFields?.description === undefined &&
        delete updatedProject.description;

      if (Object.keys(updatedProject).length > 1) {
        await updateProject(updatedProject);
      } else {
        enqueueSnackbar({
          message: "Couldn't find any changes in the field values",
          variant: "info",
        });
      }
    } else {
      await createNewProject(newProject);
    }
  };

  const createNewProject = async (newProject: ManageProjectFormInput) => {
    try {
      const { data, status } = await projectServices.createProject(newProject);
      if (data?.success && status === 200) {
        handleDialogClose();
        enqueueSnackbar({
          message: data?.message,
          variant: "success",
        });
      }
    } catch (error) {
      // Handle errors from the sign-ip API
      const {
        data: { message },
      } = error as ApiError;

      generalFunctions.fieldErrorsHandler(error as ApiError, setError);
      message.split(",").map((value) => {
        enqueueSnackbar({
          message: value,
          variant: "error",
        });
      });
    }
  };

  const updateProject = async (newProject: UpdateProjectRequest) => {
    try {
      const { data, status } = await projectServices.updateProject(newProject);
      if (data?.success && status === 200) {
        handleDialogClose();
        enqueueSnackbar({
          message: data?.message,
          variant: "success",
        });
      }
    } catch (error) {
      // Handle errors from the sign-ip API
      const {
        data: { message },
      } = error as ApiError;

      generalFunctions.fieldErrorsHandler(error as ApiError, setError);
      message.split(",").map((value) => {
        enqueueSnackbar({
          message: value,
          variant: "error",
        });
      });
    }
  };

  useEffect(() => {
    if (values?.projectName && values?.description) {
      setValue("projectName", values.projectName);
      setValue("description", values.description);
    }

    return () => reset();
  }, [reset, setValue, values]);
  return {
    isSubmitting,
    handleSubmit,
    handleDialogClose,
    control,
    onSubmit,
  };
};
