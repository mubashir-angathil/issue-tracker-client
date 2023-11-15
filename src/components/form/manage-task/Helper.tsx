import { useEffect, useState } from "react";
import { object, string, InferType, number } from "yup";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import projectServices from "../../../services/project-services/ProjectServices";
import { ApiError } from "../../../services/Helper";
import generalFunctions from "../../../utils/helpers/functions/GeneralFunctions";
import { enqueueSnackbar } from "notistack";
import {
  NavigateFunction,
  Params,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  GetTaskByIdResponse,
  ManageTaskRequest,
  UpdateTaskRequest,
} from "../../../services/project-services/Helper";
import routes from "../../../utils/helpers/routes/Routes";

export interface ManageTaskFormProps {
  updateProjects: () => Promise<void>;
}
// Define the validation schema for the sign-in form
export const manageTaskFormSchema = object({
  trackerId: number().required(),
  description: string().min(2).max(1000).required(),
}).required();

// Define the type for the form inputs based on the schema
export type ManageTaskFormInput = InferType<typeof manageTaskFormSchema>;

// Custom hook for handling sign-up logic
export const useManageTask = (values?: GetTaskByIdResponse["data"]) => {
  const navigate: NavigateFunction = useNavigate();
  const params: Params = useParams();
  const [projectId] = useState(
    params?.projectId ? parseInt(params.projectId) : 0,
  );

  // Initialize the React Hook Form with validation resolver and default values
  const {
    handleSubmit,
    control,
    setError,
    setValue,
    reset,
    formState: { touchedFields, isSubmitting },
  } = useForm<ManageTaskFormInput>({
    resolver: yupResolver(manageTaskFormSchema),
    defaultValues: {
      description: "",
    },
  });

  // Handle form submission
  const onSubmit: SubmitHandler<ManageTaskFormInput> = async (
    newTask: ManageTaskFormInput,
  ) => {
    if (projectId && !values) {
      await createNewTask({
        ...newTask,
        projectId,
      });
    } else if (values) {
      const updatedTask: UpdateTaskRequest = {
        ...newTask,
        taskId: values.id,
        projectId,
      };
      touchedFields?.description === undefined &&
        delete updatedTask.description;
      touchedFields?.trackerId === undefined && delete updatedTask.trackerId;

      Object.keys(updatedTask).length > 1
        ? await updateTask(updatedTask)
        : enqueueSnackbar({
            message: "Couldn't find any changes in the field values",
            variant: "info",
          });
    } else {
      enqueueSnackbar({
        message: "Project id is missing, go back and try agin!",
        variant: "error",
      });
    }
    // console.log(data);
  };

  const createNewTask = async (newTask: ManageTaskRequest) => {
    try {
      const { data, status } = await projectServices.createTask(newTask);

      if (data?.success && status === 200) {
        generalFunctions.goBack();
        enqueueSnackbar({
          message: data.message,
          variant: "success",
        });
      }
    } catch (error) {
      // Handle errors from the sign-ip API
      const {
        data: { message },
      } = error as ApiError;

      message.split(",").map((value) => {
        enqueueSnackbar({
          message: value,
          variant: "error",
        });
      });
    }
  };

  const updateTask = async (newTask: UpdateTaskRequest) => {
    try {
      const { data, status } = await projectServices.updateTask({
        ...newTask,
        projectId,
      });
      if (data?.success && status === 200) {
        generalFunctions.goBack();
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
    if (values) {
      setValue("trackerId", values.tracker.id);
      setValue("description", values.description);
    }
    return () => reset();
  }, [setValue, values, reset]);

  useEffect(() => {
    if (projectId === 0) {
      navigate(routes.projects.path, { replace: true });
    }
  }, [navigate, projectId]);

  return {
    isSubmitting,
    handleSubmit,
    control,
    onSubmit,
  };
};
