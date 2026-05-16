
import { FaUser } from 'react-icons/fa'
import '../../App.css'
import Input from '../../Components/commen/Input'
import { PiPasswordFill } from 'react-icons/pi'

export default function CreateRoll() {
    return (
        <div className={`w-full h-full flex flex-col justify-center items-center`}>
            <div className={`w-full h-40 flex flex-col justify-center items-center`}>
                <h1 className={`text-3xl font-bold text-gray-800 mb-2`}>Create a New Roll</h1>
                <p className={`text-gray-500 text-sm mb-6`}>Create a roll and Add Permission</p>
            </div>
            <div className="min-w-7xl p-3 h-190 shadow-md shadow-gray-950 rounded-3xl overflow-y-auto scrolls">
                <div className={`relative w-full h-50 mt-5 rounded-2xl gap-4 border border-gray-400 flex justify-center items-center flex-col p-3`}>
                    <p className={`absolute left-10 bg-white pl-3 pr-3 text-lf font-bold -top-3.5`}>Roll Information</p>

                    <Input
                        label='Roll Name'
                        icon={<FaUser />}
                        placeholder='Enter Roll name'
                    />
                    <Input
                        type='password'
                        label='Roll Code'
                        icon={<PiPasswordFill />}
                        placeholder='Enter Roll name'
                    />
                </div>
                <div className={`relative w-full h-auto mt-5 rounded-2xl gap-4 border border-gray-400 flex justify-center items-center flex-col p-3`}>
                    <p className={`absolute left-10 bg-white pl-3 pr-3 text-lf font-bold -top-3.5`}
                    >
                        Permissions
                    </p>
                    <div className={`w-full h-20 rounded-2xl`}>

                    </div>
                </div>
            </div>
        </div>
    )
}
