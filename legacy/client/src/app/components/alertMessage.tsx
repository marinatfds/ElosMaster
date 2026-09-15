import toastr from 'toastr';
toastr.options = {
    positionClass: 'toast-top-center',
    hideDuration: 300,
    timeOut: 60000,
    toastClass: 'tamanho'
};

export const showMessage = (message: string) => toastr.success(message);
export const showErrorMessage = (message: string) => toastr.error(message);
export const showDomainErrorMessage = (message: {Key: string, Message: string}) => toastr.error(message.Message);