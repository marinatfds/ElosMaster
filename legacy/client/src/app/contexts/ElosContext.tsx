import React, { createContext, useState } from 'react';
import { ElosContextType } from "./ElosContextType";
import BlockUi from 'react-block-ui';
import { showDomainErrorMessage, showMessage } from '../components/alertMessage';

export const ElosContext = createContext<ElosContextType>({
    isBlocking: false,
    Blocking: () => { },
    Unblocking: () => { },
    RemoveEmptyFields: () => { },
    ShowValidateMessages: () => { },
});

const ElosProvider = (props: any) => {

    const [isBlocking, setIsBlocking] = useState<boolean>(false);

    const showBlocking = (isBlocking: boolean) => {
        setIsBlocking(isBlocking);
    }

    const Blocking = () => { if (!isBlocking) showBlocking(true) }

    const Unblocking = () => showBlocking(false);

    const ShowValidateMessages = (response: any) => {
        let result = response.data;
        if (response.status === 400 ||
            response.status === 500) {
            if (Array.isArray(result)) {
                for (let index = 0; index < result.length; index++)
                    showDomainErrorMessage(result[index]);
            } else
                showErrorMessage(result);
        } else
            showMessage(result)
    }

    const RemoveEmptyFields = (data: any) => {
        Object.keys(data).forEach(key => {
            if (data[key] === '' || data[key] == null)
                delete data[key];
        });
    }

    const values = { isBlocking, Blocking, Unblocking, RemoveEmptyFields, ShowValidateMessages }
    return (
        <BlockUi blocking={isBlocking}>
            <ElosContext.Provider value={values}>
                {props.children}
            </ElosContext.Provider>
        </BlockUi>
    );
}

export default ElosProvider;

function showErrorMessage(result: any) {
    throw new Error('Function not implemented.');
}
